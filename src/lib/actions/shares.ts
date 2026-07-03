"use server";

import { createClient } from "@/lib/supabase/server";

const CHANNELS = ["whatsapp", "facebook", "linkedin", "x", "copy_link", "email"] as const;
export type ShareChannel = (typeof CHANNELS)[number];

export async function logShare(renderId: string, channel: ShareChannel) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("shares").insert({ user_id: user.id, render_id: renderId, channel });
}
