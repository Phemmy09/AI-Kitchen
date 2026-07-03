import { createClient } from "@/lib/supabase/server";

export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  role: "customer" | "admin" | "super_admin";
  plan: "free" | "monthly" | "annual";
  credits: number;
  status: "active" | "suspended";
  created_at: string;
};

export async function getDashboardStats() {
  const supabase = await createClient();
  const since30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [
    { count: totalUsers },
    { count: activeUsers },
    { count: suspendedUsers },
    { count: paidUsers },
    { count: visualisations30d },
    { data: renders30d },
    { count: shares30d },
  ] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("status", "suspended"),
    supabase.from("profiles").select("id", { count: "exact", head: true }).neq("plan", "free"),
    supabase.from("renders").select("id", { count: "exact", head: true }).gte("created_at", since30d),
    supabase.from("renders").select("credits_used").gte("created_at", since30d),
    supabase.from("shares").select("id", { count: "exact", head: true }).gte("created_at", since30d),
  ]);

  const { data: settings } = await supabase.from("platform_settings").select("monthly_price_cents").eq("id", 1).single();

  const creditsSpent = (renders30d ?? []).reduce((sum, r) => sum + (r.credits_used ?? 0), 0);
  const estRevenueCents = (paidUsers ?? 0) * (settings?.monthly_price_cents ?? 0);

  return {
    totalUsers: totalUsers ?? 0,
    activeUsers: activeUsers ?? 0,
    suspendedUsers: suspendedUsers ?? 0,
    paidUsers: paidUsers ?? 0,
    visualisations30d: visualisations30d ?? 0,
    creditsSpent30d: creditsSpent,
    shares30d: shares30d ?? 0,
    estRevenueCents,
  };
}

export async function getShareChannelBreakdown() {
  const supabase = await createClient();
  const since30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data } = await supabase.from("shares").select("channel").gte("created_at", since30d);

  const counts: Record<string, number> = {};
  (data ?? []).forEach((s) => {
    counts[s.channel] = (counts[s.channel] ?? 0) + 1;
  });
  return counts;
}

export async function getTopStones(limit = 6) {
  const supabase = await createClient();
  const { data } = await supabase.from("renders").select("stone_colour_id, stone_colours(name, brand_id, brands(name))");

  const counts = new Map<string, { name: string; brand: string; uses: number }>();
  (data ?? []).forEach((r) => {
    const colour = r.stone_colours as unknown as { name: string; brands: { name: string } } | null;
    if (!colour || !r.stone_colour_id) return;
    const existing = counts.get(r.stone_colour_id);
    if (existing) existing.uses += 1;
    else counts.set(r.stone_colour_id, { name: colour.name, brand: colour.brands?.name ?? "", uses: 1 });
  });

  return [...counts.values()].sort((a, b) => b.uses - a.uses).slice(0, limit);
}

export async function getAllUsers(): Promise<AdminUserRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, name, email, role, plan, credits, status, created_at")
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function getAuditLog(limit = 100) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("admin_audit_log")
    .select("id, action, target_type, target_id, metadata, created_at, profiles!admin_audit_log_admin_id_fkey(name, email)")
    .order("created_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}
