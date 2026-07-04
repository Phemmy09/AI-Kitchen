"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type SaveRenderResult = { error: string } | { limitReached: true } | { success: true };

export async function saveRender(renderId: string): Promise<SaveRenderResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in." };

  const [{ data: settings }, { count }] = await Promise.all([
    supabase.from("platform_settings").select("max_saved_projects").eq("id", 1).single(),
    supabase
      .from("renders")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("is_saved", true),
  ]);

  const limit = settings?.max_saved_projects ?? 2;
  if ((count ?? 0) >= limit) {
    return { limitReached: true };
  }

  const { error } = await supabase
    .from("renders")
    .update({ is_saved: true, expires_at: new Date("9999-12-31T23:59:59Z").toISOString() })
    .eq("id", renderId)
    .eq("user_id", user.id);

  if (error) return { error: "Could not save this project." };

  revalidatePath("/my-renders");
  return { success: true };
}

export async function unsaveRender(renderId: string): Promise<SaveRenderResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in." };

  const { data: settings } = await supabase
    .from("platform_settings")
    .select("temp_storage_hours")
    .eq("id", 1)
    .single();

  const { error } = await supabase
    .from("renders")
    .update({
      is_saved: false,
      expires_at: new Date(
        Date.now() + (settings?.temp_storage_hours ?? 48) * 60 * 60 * 1000,
      ).toISOString(),
    })
    .eq("id", renderId)
    .eq("user_id", user.id);

  if (error) return { error: "Could not remove this project." };

  revalidatePath("/my-renders");
  return { success: true };
}

export async function deleteRender(renderId: string): Promise<SaveRenderResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in." };

  const { error } = await supabase.from("renders").delete().eq("id", renderId).eq("user_id", user.id);
  if (error) return { error: "Could not delete this project." };

  revalidatePath("/my-renders");
  return { success: true };
}
