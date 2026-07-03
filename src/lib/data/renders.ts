import { createClient } from "@/lib/supabase/server";

export type RenderRow = {
  id: string;
  name: string | null;
  source_image_url: string;
  result_image_url: string | null;
  watermarked_image_url: string | null;
  is_saved: boolean;
  expires_at: string | null;
  created_at: string;
  stone_colours: { name: string } | null;
};

export async function getUserRenders(userId: string): Promise<RenderRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("renders")
    .select(
      "id, name, source_image_url, result_image_url, watermarked_image_url, is_saved, expires_at, created_at, stone_colours(name)",
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return (data as unknown as RenderRow[]) ?? [];
}

export async function getMaxSavedProjects(): Promise<number> {
  const supabase = await createClient();
  const { data } = await supabase.from("platform_settings").select("max_saved_projects").eq("id", 1).single();
  return data?.max_saved_projects ?? 2;
}
