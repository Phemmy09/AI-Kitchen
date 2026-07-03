"use server";

import { requireAdminContext, logAdminAction, NotAdminError } from "@/lib/actions/admin/guard";
import { revalidatePath } from "next/cache";
import type { AdminActionResult } from "@/lib/actions/admin/users";

function fail(err: unknown, fallback: string): AdminActionResult {
  return err instanceof NotAdminError ? { error: err.message } : { error: fallback };
}

export async function createCategory(formData: FormData): Promise<AdminActionResult> {
  try {
    const ctx = await requireAdminContext();
    const name = String(formData.get("name") ?? "").trim();
    if (!name) return { error: "Category name is required." };

    const { count } = await ctx.supabase.from("categories").select("id", { count: "exact", head: true });
    const { data, error } = await ctx.supabase
      .from("categories")
      .insert({ name, sort_order: count ?? 0 })
      .select("id")
      .single();
    if (error || !data) return { error: "Could not create this category." };

    await logAdminAction(ctx, "create_category", "category", data.id, { name });
    revalidatePath("/admin/categories");
    return { success: true };
  } catch (err) {
    return fail(err, "Could not create this category.");
  }
}

export async function toggleCategoryEnabled(categoryId: string, enabled: boolean): Promise<AdminActionResult> {
  try {
    const ctx = await requireAdminContext();
    const { error } = await ctx.supabase.from("categories").update({ enabled }).eq("id", categoryId);
    if (error) return { error: "Could not update this category." };
    await logAdminAction(ctx, enabled ? "enable_category" : "disable_category", "category", categoryId);
    revalidatePath("/admin/categories");
    return { success: true };
  } catch (err) {
    return fail(err, "Could not update this category.");
  }
}

export async function deleteCategory(categoryId: string): Promise<AdminActionResult> {
  try {
    const ctx = await requireAdminContext();
    const { error } = await ctx.supabase.from("categories").delete().eq("id", categoryId);
    if (error) return { error: "Could not delete this category." };
    await logAdminAction(ctx, "delete_category", "category", categoryId);
    revalidatePath("/admin/categories");
    return { success: true };
  } catch (err) {
    return fail(err, "Could not delete this category.");
  }
}

export async function reorderCategory(categoryId: string, direction: "up" | "down"): Promise<AdminActionResult> {
  try {
    const ctx = await requireAdminContext();
    const { data: categories } = await ctx.supabase.from("categories").select("id, sort_order").order("sort_order");
    if (!categories) return { error: "Could not load categories." };

    const index = categories.findIndex((c) => c.id === categoryId);
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (index < 0 || swapIndex < 0 || swapIndex >= categories.length) return { success: true };

    const a = categories[index];
    const b = categories[swapIndex];
    await Promise.all([
      ctx.supabase.from("categories").update({ sort_order: b.sort_order }).eq("id", a.id),
      ctx.supabase.from("categories").update({ sort_order: a.sort_order }).eq("id", b.id),
    ]);

    await logAdminAction(ctx, "reorder_category", "category", categoryId, { direction });
    revalidatePath("/admin/categories");
    return { success: true };
  } catch (err) {
    return fail(err, "Could not reorder categories.");
  }
}
