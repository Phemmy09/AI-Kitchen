"use server";

import { createClient } from "@/lib/supabase/server";

export async function logDownload(renderId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("download_events").insert({ user_id: user.id, render_id: renderId });
}
