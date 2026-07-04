"use server";

import { requireAdminContext, logAdminAction, NotAdminError } from "@/lib/actions/admin/guard";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { getUserRenders, type RenderRow } from "@/lib/data/renders";
import { revalidatePath } from "next/cache";

export type AdminActionResult = { error: string } | { success: true };

export async function getUserDetail(userId: string): Promise<{ renders: RenderRow[] } | { error: string }> {
  try {
    await requireAdminContext();
    return { renders: await getUserRenders(userId) };
  } catch (err) {
    return err instanceof NotAdminError ? { error: err.message } : { error: "Could not load this user's renders." };
  }
}

export async function suspendUser(userId: string): Promise<AdminActionResult> {
  try {
    const ctx = await requireAdminContext();
    const { error } = await ctx.supabase.from("profiles").update({ status: "suspended" }).eq("id", userId);
    if (error) return { error: "Could not suspend this user." };
    await logAdminAction(ctx, "suspend_user", "user", userId);
    revalidatePath("/admin/users");
    return { success: true };
  } catch (err) {
    return err instanceof NotAdminError ? { error: err.message } : { error: "Something went wrong." };
  }
}

export async function unsuspendUser(userId: string): Promise<AdminActionResult> {
  try {
    const ctx = await requireAdminContext();
    const { error } = await ctx.supabase.from("profiles").update({ status: "active" }).eq("id", userId);
    if (error) return { error: "Could not reactivate this user." };
    await logAdminAction(ctx, "unsuspend_user", "user", userId);
    revalidatePath("/admin/users");
    return { success: true };
  } catch (err) {
    return err instanceof NotAdminError ? { error: err.message } : { error: "Something went wrong." };
  }
}

export async function resetUserCredits(userId: string, amount: number): Promise<AdminActionResult> {
  try {
    const ctx = await requireAdminContext();
    const { error } = await ctx.supabase.from("profiles").update({ credits: amount }).eq("id", userId);
    if (error) return { error: "Could not reset credits." };
    await ctx.supabase
      .from("credit_transactions")
      .insert({ user_id: userId, delta: amount, reason: "admin_reset", created_by: ctx.adminId });
    await logAdminAction(ctx, "reset_credits", "user", userId, { amount });
    revalidatePath("/admin/users");
    return { success: true };
  } catch (err) {
    return err instanceof NotAdminError ? { error: err.message } : { error: "Something went wrong." };
  }
}

export async function updateUserRole(
  userId: string,
  role: "customer" | "admin" | "super_admin",
): Promise<AdminActionResult> {
  try {
    const ctx = await requireAdminContext({ superAdminOnly: true });
    const { error } = await ctx.supabase.from("profiles").update({ role }).eq("id", userId);
    if (error) return { error: "Could not update this user's role." };
    await logAdminAction(ctx, "update_role", "user", userId, { role });
    revalidatePath("/admin/users");
    return { success: true };
  } catch (err) {
    return err instanceof NotAdminError ? { error: err.message } : { error: "Something went wrong." };
  }
}

export async function deleteUserPermanently(userId: string): Promise<AdminActionResult> {
  try {
    const ctx = await requireAdminContext({ superAdminOnly: true });
    const admin = createServiceRoleClient();
    const { error } = await admin.auth.admin.deleteUser(userId);
    if (error) return { error: "Could not delete this user." };
    await logAdminAction(ctx, "delete_user", "user", userId);
    revalidatePath("/admin/users");
    return { success: true };
  } catch (err) {
    return err instanceof NotAdminError ? { error: err.message } : { error: "Something went wrong." };
  }
}
