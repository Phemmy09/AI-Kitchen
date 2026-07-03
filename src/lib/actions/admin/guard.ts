import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

export class NotAdminError extends Error {
  constructor() {
    super("You don't have permission to do this.");
    this.name = "NotAdminError";
  }
}

export type AdminContext = {
  supabase: SupabaseClient;
  adminId: string;
  role: "admin" | "super_admin";
};

// Every admin server action must call this first and use the returned
// `supabase` client for its work - never trust a role/flag from the client,
// always re-read it from the DB under the caller's own session.
export async function requireAdminContext(options?: { superAdminOnly?: boolean }): Promise<AdminContext> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new NotAdminError();

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || (profile.role !== "admin" && profile.role !== "super_admin")) throw new NotAdminError();
  if (options?.superAdminOnly && profile.role !== "super_admin") throw new NotAdminError();

  return { supabase, adminId: user.id, role: profile.role };
}

export async function logAdminAction(
  ctx: AdminContext,
  action: string,
  targetType?: string,
  targetId?: string,
  metadata: Record<string, unknown> = {},
) {
  await ctx.supabase
    .from("admin_audit_log")
    .insert({ admin_id: ctx.adminId, action, target_type: targetType, target_id: targetId, metadata });
}
