"use server";

import { requireAdminContext, logAdminAction, NotAdminError } from "@/lib/actions/admin/guard";
import { revalidatePath } from "next/cache";
import type { AdminActionResult } from "@/lib/actions/admin/users";

export async function updatePlatformSettings(formData: FormData): Promise<AdminActionResult> {
  try {
    const ctx = await requireAdminContext({ superAdminOnly: true });

    const currency = String(formData.get("currency") ?? "gbp");
    if (!["gbp", "usd"].includes(currency)) return { error: "Invalid currency." };

    const updates = {
      free_credits_enabled: formData.get("free_credits_enabled") === "on",
      subscriptions_enabled: formData.get("subscriptions_enabled") === "on",
      free_credit_amount: Number(formData.get("free_credit_amount")),
      currency,
      monthly_price_cents: Math.round(Number(formData.get("monthly_price")) * 100),
      monthly_credits: Number(formData.get("monthly_credits")),
      annual_price_cents: Math.round(Number(formData.get("annual_price")) * 100),
      annual_credits: Number(formData.get("annual_credits")),
      temp_storage_hours: Number(formData.get("temp_storage_hours")),
      max_saved_projects: Number(formData.get("max_saved_projects")),
      max_upload_mb: Number(formData.get("max_upload_mb")),
      updated_at: new Date().toISOString(),
    };

    for (const [key, value] of Object.entries(updates)) {
      if (typeof value === "number" && (Number.isNaN(value) || value < 0)) {
        return { error: `Invalid value for ${key}.` };
      }
    }

    const { error } = await ctx.supabase.from("platform_settings").update(updates).eq("id", 1);
    if (error) return { error: "Could not save settings." };

    await logAdminAction(ctx, "update_platform_settings", "settings", "1", updates);
    revalidatePath("/admin/settings");
    revalidatePath("/credits");
    return { success: true };
  } catch (err) {
    return err instanceof NotAdminError ? { error: err.message } : { error: "Could not save settings." };
  }
}
