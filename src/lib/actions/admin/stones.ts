"use server";

import { requireAdminContext, logAdminAction, NotAdminError } from "@/lib/actions/admin/guard";
import { revalidatePath } from "next/cache";
import type { AdminActionResult } from "@/lib/actions/admin/users";

function fail(err: unknown, fallback: string): AdminActionResult {
  return err instanceof NotAdminError ? { error: err.message } : { error: fallback };
}

export async function createBrand(formData: FormData): Promise<AdminActionResult> {
  try {
    const ctx = await requireAdminContext();
    const name = String(formData.get("name") ?? "").trim();
    const categoryId = String(formData.get("categoryId") ?? "") || null;
    const description = String(formData.get("description") ?? "");
    if (!name) return { error: "Brand name is required." };

    const { data, error } = await ctx.supabase
      .from("brands")
      .insert({ name, category_id: categoryId, description })
      .select("id")
      .single();
    if (error || !data) return { error: "Could not create this brand." };

    await logAdminAction(ctx, "create_brand", "brand", data.id, { name });
    revalidatePath("/admin/stones");
    return { success: true };
  } catch (err) {
    return fail(err, "Could not create this brand.");
  }
}

export async function toggleBrandEnabled(brandId: string, enabled: boolean): Promise<AdminActionResult> {
  try {
    const ctx = await requireAdminContext();
    const { error } = await ctx.supabase.from("brands").update({ enabled }).eq("id", brandId);
    if (error) return { error: "Could not update this brand." };
    await logAdminAction(ctx, enabled ? "enable_brand" : "disable_brand", "brand", brandId);
    revalidatePath("/admin/stones");
    return { success: true };
  } catch (err) {
    return fail(err, "Could not update this brand.");
  }
}

export async function deleteBrand(brandId: string): Promise<AdminActionResult> {
  try {
    const ctx = await requireAdminContext();
    const { error } = await ctx.supabase.from("brands").delete().eq("id", brandId);
    if (error) return { error: "Could not delete this brand." };
    await logAdminAction(ctx, "delete_brand", "brand", brandId);
    revalidatePath("/admin/stones");
    return { success: true };
  } catch (err) {
    return fail(err, "Could not delete this brand.");
  }
}

export async function createColour(formData: FormData): Promise<AdminActionResult> {
  try {
    const ctx = await requireAdminContext();
    const brandId = String(formData.get("brandId") ?? "");
    const name = String(formData.get("name") ?? "").trim();
    const sku = String(formData.get("sku") ?? "");
    const finish = String(formData.get("finish") ?? "");
    const textureFile = formData.get("texture");

    if (!brandId || !name) return { error: "Brand and colour name are required." };
    if (!(textureFile instanceof File) || textureFile.size === 0) {
      return { error: "A texture image is required." };
    }

    const ext = textureFile.type === "image/png" ? "png" : "jpg";
    const path = `colours/${brandId}/${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await ctx.supabase.storage
      .from("stone-library")
      .upload(path, Buffer.from(await textureFile.arrayBuffer()), { contentType: textureFile.type });
    if (uploadError) return { error: "Could not upload the texture image." };

    const textureUrl = ctx.supabase.storage.from("stone-library").getPublicUrl(path).data.publicUrl;

    const { data, error } = await ctx.supabase
      .from("stone_colours")
      .insert({ brand_id: brandId, name, sku, finish, texture_url: textureUrl })
      .select("id")
      .single();
    if (error || !data) return { error: "Could not create this stone colour." };

    await logAdminAction(ctx, "create_colour", "colour", data.id, { name, brandId });
    revalidatePath("/admin/stones");
    return { success: true };
  } catch (err) {
    return fail(err, "Could not create this stone colour.");
  }
}

export async function toggleColourEnabled(colourId: string, enabled: boolean): Promise<AdminActionResult> {
  try {
    const ctx = await requireAdminContext();
    const { error } = await ctx.supabase.from("stone_colours").update({ enabled }).eq("id", colourId);
    if (error) return { error: "Could not update this colour." };
    await logAdminAction(ctx, enabled ? "enable_colour" : "disable_colour", "colour", colourId);
    revalidatePath("/admin/stones");
    return { success: true };
  } catch (err) {
    return fail(err, "Could not update this colour.");
  }
}

export async function deleteColour(colourId: string): Promise<AdminActionResult> {
  try {
    const ctx = await requireAdminContext();
    const { error } = await ctx.supabase.from("stone_colours").delete().eq("id", colourId);
    if (error) return { error: "Could not delete this colour." };
    await logAdminAction(ctx, "delete_colour", "colour", colourId);
    revalidatePath("/admin/stones");
    return { success: true };
  } catch (err) {
    return fail(err, "Could not delete this colour.");
  }
}

// Bulk import: one line per colour as "brandId,name,sku,finish,textureUrl"
// (textureUrl pointing at an already-hosted image) - keeps the bulk path
// simple since a zip-of-images upload flow would need a much bigger surface
// (server-side zip extraction, per-file validation) for the same outcome.
export async function bulkCreateColours(formData: FormData): Promise<AdminActionResult> {
  try {
    const ctx = await requireAdminContext();
    const csv = String(formData.get("csv") ?? "").trim();
    if (!csv) return { error: "Paste at least one row." };

    const rows = csv
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [brand_id, name, sku, finish, texture_url] = line.split(",").map((v) => v.trim());
        return { brand_id, name, sku, finish, texture_url };
      })
      .filter((r) => r.brand_id && r.name && r.texture_url);

    if (rows.length === 0) return { error: "No valid rows found. Format: brandId,name,sku,finish,textureUrl" };

    const { error } = await ctx.supabase.from("stone_colours").insert(rows);
    if (error) return { error: "Could not import these colours." };

    await logAdminAction(ctx, "bulk_create_colours", "colour", undefined, { count: rows.length });
    revalidatePath("/admin/stones");
    return { success: true };
  } catch (err) {
    return fail(err, "Could not import these colours.");
  }
}
