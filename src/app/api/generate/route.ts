import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import {
  generateStoneSwap,
  classifyIsKitchenPhoto,
  AIProviderNotConfiguredError,
  AIGenerationFailedError,
} from "@/lib/ai";
import { applyWatermark } from "@/lib/images/watermark";

export const runtime = "nodejs";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

async function fileToInlineImage(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());
  return { base64: buffer.toString("base64"), mimeType: file.type, buffer };
}

async function urlToInlineImage(url: string) {
  const res = await fetch(url);
  const buffer = Buffer.from(await res.arrayBuffer());
  return {
    base64: buffer.toString("base64"),
    mimeType: res.headers.get("content-type") ?? "image/jpeg",
  };
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Please sign in to generate a render." }, { status: 401 });

  const formData = await request.formData();
  const image = formData.get("image");
  const stoneColourId = formData.get("stoneColourId");
  const refinement = String(formData.get("refinement") ?? "");

  if (!(image instanceof File) || !stoneColourId || typeof stoneColourId !== "string") {
    return NextResponse.json({ error: "Missing kitchen photo or stone selection." }, { status: 400 });
  }
  if (!ALLOWED_TYPES.has(image.type)) {
    return NextResponse.json({ error: "Please upload a JPG, PNG or WEBP photo." }, { status: 400 });
  }

  const [{ data: profile }, { data: settings }, { data: stone }] = await Promise.all([
    supabase.from("profiles").select("credits, status").eq("id", user.id).single(),
    supabase.from("platform_settings").select("*").eq("id", 1).single(),
    supabase.from("stone_colours").select("id, name, texture_url").eq("id", stoneColourId).single(),
  ]);

  if (!profile || profile.status === "suspended") {
    return NextResponse.json({ error: "This account cannot generate renders." }, { status: 403 });
  }
  if (!settings) {
    return NextResponse.json({ error: "Platform is not configured yet." }, { status: 500 });
  }
  if (!stone) {
    return NextResponse.json({ error: "Selected stone colour was not found." }, { status: 404 });
  }

  const maxBytes = settings.max_upload_mb * 1024 * 1024;
  if (image.size > maxBytes) {
    return NextResponse.json(
      { error: `Photo is too large. Max size is ${settings.max_upload_mb}MB.` },
      { status: 413 },
    );
  }

  const paidMode = settings.subscriptions_enabled === true;
  if (paidMode && profile.credits <= 0) {
    return NextResponse.json(
      { error: "You're out of credits.", code: "OUT_OF_CREDITS" },
      { status: 402 },
    );
  }

  const sourceImage = await fileToInlineImage(image);

  try {
    const isKitchen = await classifyIsKitchenPhoto(sourceImage);
    if (!isKitchen) {
      return NextResponse.json(
        { error: "This doesn't look like a kitchen photo. Please upload a clear photo of a kitchen." },
        { status: 422 },
      );
    }

    const stoneTextureImage = await urlToInlineImage(stone.texture_url);
    const result = await generateStoneSwap({
      sourceImage,
      stoneTextureImage,
      stoneName: stone.name,
      refinement,
    });

    const resultBuffer = Buffer.from(result.base64, "base64");
    const watermarkedBuffer = await applyWatermark(resultBuffer);

    const ext = image.type === "image/png" ? "png" : "jpg";
    const uploadPath = `${user.id}/${randomUUID()}.${ext}`;
    const resultPath = `${user.id}/${randomUUID()}.png`;
    const watermarkedPath = `${user.id}/${randomUUID()}-wm.jpg`;

    const [uploadRes, renderRes, watermarkedRes] = await Promise.all([
      supabase.storage.from("uploads").upload(uploadPath, sourceImage.buffer, { contentType: image.type }),
      supabase.storage.from("renders").upload(resultPath, resultBuffer, { contentType: result.mimeType }),
      supabase.storage
        .from("renders")
        .upload(watermarkedPath, watermarkedBuffer, { contentType: "image/jpeg" }),
    ]);

    if (uploadRes.error || renderRes.error || watermarkedRes.error) {
      return NextResponse.json({ error: "Could not save the render. Please try again." }, { status: 500 });
    }

    const sourceUrl = supabase.storage.from("uploads").getPublicUrl(uploadPath).data.publicUrl;
    const resultUrl = supabase.storage.from("renders").getPublicUrl(resultPath).data.publicUrl;
    const watermarkedUrl = supabase.storage.from("renders").getPublicUrl(watermarkedPath).data.publicUrl;

    const { data: render, error: insertError } = await supabase
      .from("renders")
      .insert({
        user_id: user.id,
        source_image_url: sourceUrl,
        result_image_url: resultUrl,
        watermarked_image_url: watermarkedUrl,
        stone_colour_id: stone.id,
        credits_used: paidMode ? 1 : 0,
        expires_at: new Date(Date.now() + settings.temp_storage_hours * 60 * 60 * 1000).toISOString(),
      })
      .select("id")
      .single();

    if (insertError || !render) {
      return NextResponse.json({ error: "Could not save the render. Please try again." }, { status: 500 });
    }

    let creditsRemaining = profile.credits;
    if (paidMode) {
      const admin = createServiceRoleClient();
      const { data: newBalance, error: redeemError } = await admin.rpc("redeem_credit", {
        p_user_id: user.id,
        p_reason: "generation",
      });
      if (!redeemError) creditsRemaining = newBalance as number;
    }

    return NextResponse.json({
      renderId: render.id,
      resultImageUrl: resultUrl,
      watermarkedImageUrl: watermarkedUrl,
      creditsRemaining,
    });
  } catch (err) {
    if (err instanceof AIProviderNotConfiguredError) {
      return NextResponse.json(
        { error: "The AI visualiser isn't fully set up yet - please check back soon." },
        { status: 503 },
      );
    }
    if (err instanceof AIGenerationFailedError) {
      return NextResponse.json({ error: err.message }, { status: 502 });
    }
    console.error("generate route error", err);
    return NextResponse.json({ error: "Something went wrong generating your render." }, { status: 500 });
  }
}
