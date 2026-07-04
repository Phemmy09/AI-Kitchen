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
  last_active: string;
  visualisations_count: number;
  downloads_count: number;
};

export type ActivityPoint = {
  date: string;
  label: string;
  visualisations: number;
  downloads: number;
  shares: number;
  newUsers: number;
};

export async function getDashboardStats() {
  const supabase = await createClient();
  const since30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [
    { count: totalUsers },
    { count: activeUsers },
    { count: suspendedUsers },
    { count: paidUsers },
    { count: newUsers30d },
    { data: allPlans },
    { count: visualisations30d },
    { data: renders30d },
    { count: shares30d },
    { count: downloads30d },
  ] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("status", "suspended"),
    supabase.from("profiles").select("id", { count: "exact", head: true }).neq("plan", "free"),
    supabase.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", since30d),
    supabase.from("profiles").select("plan"),
    supabase.from("renders").select("id", { count: "exact", head: true }).gte("created_at", since30d),
    supabase.from("renders").select("credits_used").gte("created_at", since30d),
    supabase.from("shares").select("id", { count: "exact", head: true }).gte("created_at", since30d),
    supabase.from("download_events").select("id", { count: "exact", head: true }).gte("created_at", since30d),
  ]);

  const { data: settings } = await supabase.from("platform_settings").select("monthly_price_cents").eq("id", 1).single();

  const creditsSpent = (renders30d ?? []).reduce((sum, r) => sum + (r.credits_used ?? 0), 0);
  const estRevenueCents = (paidUsers ?? 0) * (settings?.monthly_price_cents ?? 0);

  const planBreakdown = { free: 0, monthly: 0, annual: 0 };
  (allPlans ?? []).forEach((p) => {
    if (p.plan === "monthly") planBreakdown.monthly += 1;
    else if (p.plan === "annual") planBreakdown.annual += 1;
    else planBreakdown.free += 1;
  });

  return {
    totalUsers: totalUsers ?? 0,
    activeUsers: activeUsers ?? 0,
    suspendedUsers: suspendedUsers ?? 0,
    paidUsers: paidUsers ?? 0,
    newUsers30d: newUsers30d ?? 0,
    planBreakdown,
    visualisations30d: visualisations30d ?? 0,
    creditsSpent30d: creditsSpent,
    shares30d: shares30d ?? 0,
    downloads30d: downloads30d ?? 0,
    estRevenueCents,
  };
}

// Zero-filled daily buckets so the activity charts render a full 30-day
// series even on a near-empty project, instead of a sparse/broken-looking
// line with gaps.
export async function getActivityTimeSeries(days = 30): Promise<ActivityPoint[]> {
  const supabase = await createClient();
  const sinceIso = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const [{ data: renders }, { data: downloads }, { data: shares }, { data: newUsers }] = await Promise.all([
    supabase.from("renders").select("created_at").gte("created_at", sinceIso),
    supabase.from("download_events").select("created_at").gte("created_at", sinceIso),
    supabase.from("shares").select("created_at").gte("created_at", sinceIso),
    supabase.from("profiles").select("created_at").gte("created_at", sinceIso),
  ]);

  const bucket = (rows: { created_at: string }[] | null) => {
    const counts: Record<string, number> = {};
    (rows ?? []).forEach((r) => {
      const day = r.created_at.slice(0, 10);
      counts[day] = (counts[day] ?? 0) + 1;
    });
    return counts;
  };

  const visCounts = bucket(renders);
  const dlCounts = bucket(downloads);
  const shareCounts = bucket(shares);
  const userCounts = bucket(newUsers);

  const points: ActivityPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    points.push({
      date: key,
      label: d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
      visualisations: visCounts[key] ?? 0,
      downloads: dlCounts[key] ?? 0,
      shares: shareCounts[key] ?? 0,
      newUsers: userCounts[key] ?? 0,
    });
  }
  return points;
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
  const { data } = await supabase
    .from("renders")
    .select("stone_colour_id, stone_colours(name, texture_url, brand_id, brands(name))");

  const counts = new Map<string, { name: string; brand: string; textureUrl: string; uses: number }>();
  (data ?? []).forEach((r) => {
    const colour = r.stone_colours as unknown as {
      name: string;
      texture_url: string;
      brands: { name: string };
    } | null;
    if (!colour || !r.stone_colour_id) return;
    const existing = counts.get(r.stone_colour_id);
    if (existing) existing.uses += 1;
    else
      counts.set(r.stone_colour_id, {
        name: colour.name,
        brand: colour.brands?.name ?? "",
        textureUrl: colour.texture_url,
        uses: 1,
      });
  });

  return [...counts.values()].sort((a, b) => b.uses - a.uses).slice(0, limit);
}

export async function getAllUsers(): Promise<AdminUserRow[]> {
  const supabase = await createClient();
  const [{ data: profiles }, { data: renders }, { data: downloads }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, name, email, role, plan, credits, status, created_at, updated_at")
      .order("created_at", { ascending: false }),
    supabase.from("renders").select("user_id"),
    supabase.from("download_events").select("user_id"),
  ]);

  const renderCounts: Record<string, number> = {};
  (renders ?? []).forEach((r) => {
    renderCounts[r.user_id] = (renderCounts[r.user_id] ?? 0) + 1;
  });
  const downloadCounts: Record<string, number> = {};
  (downloads ?? []).forEach((d) => {
    downloadCounts[d.user_id] = (downloadCounts[d.user_id] ?? 0) + 1;
  });

  return (profiles ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    email: p.email,
    role: p.role,
    plan: p.plan,
    credits: p.credits,
    status: p.status,
    created_at: p.created_at,
    // Best-effort proxy: bumped by redeem_credit() on every render, but also
    // by unrelated admin edits (role/credit changes) - not a precise "last
    // seen timestamp", just the closest thing available without extra
    // session tracking.
    last_active: p.updated_at,
    visualisations_count: renderCounts[p.id] ?? 0,
    downloads_count: downloadCounts[p.id] ?? 0,
  }));
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
