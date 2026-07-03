import { createClient } from "@/lib/supabase/server";

export type PlatformSettings = {
  id: number;
  free_credits_enabled: boolean;
  subscriptions_enabled: boolean;
  free_credit_amount: number;
  monthly_price_cents: number;
  monthly_credits: number;
  annual_price_cents: number;
  annual_credits: number;
  currency: string;
  temp_storage_hours: number;
  max_saved_projects: number;
  max_upload_mb: number;
};

// Mirrors the DEFAULT values in supabase/schema.sql's platform_settings
// table - used only if that row is missing (e.g. schema.sql hasn't been run
// yet), so pages render sensibly instead of 500ing on a null read.
const FALLBACK_SETTINGS: PlatformSettings = {
  id: 1,
  free_credits_enabled: true,
  subscriptions_enabled: true,
  free_credit_amount: 10,
  monthly_price_cents: 999,
  monthly_credits: 100,
  annual_price_cents: 8999,
  annual_credits: 1500,
  currency: "usd",
  temp_storage_hours: 48,
  max_saved_projects: 2,
  max_upload_mb: 10,
};

export async function getPlatformSettings(): Promise<PlatformSettings> {
  const supabase = await createClient();
  const { data } = await supabase.from("platform_settings").select("*").eq("id", 1).single();
  return (data as PlatformSettings) ?? FALLBACK_SETTINGS;
}
