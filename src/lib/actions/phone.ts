"use server";

import { createClient } from "@/lib/supabase/server";
import type { AuthResult } from "@/lib/actions/auth";

// Requires a phone provider (Twilio) configured in Supabase Auth settings.
// See .env.local.example for the Twilio credentials this depends on.
export async function sendPhoneOtp(formData: FormData): Promise<AuthResult> {
  const phone = String(formData.get("phone") ?? "").trim();
  if (!phone.match(/^\+[1-9]\d{7,14}$/)) {
    return { error: "Enter a valid phone number in international format, e.g. +14155552671." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ phone });
  if (error) return { error: error.message };

  return { success: true };
}

export async function verifyPhoneOtp(formData: FormData): Promise<AuthResult> {
  const phone = String(formData.get("phone") ?? "").trim();
  const token = String(formData.get("token") ?? "").trim();
  if (!token) return { error: "Enter the verification code sent to your phone." };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.verifyOtp({
    phone,
    token,
    type: "phone_change",
  });
  if (error) return { error: error.message };

  await supabase
    .from("profiles")
    .update({ phone, phone_verified: true })
    .eq("id", data.user!.id);

  return { success: true };
}
