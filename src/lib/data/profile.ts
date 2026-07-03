import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type Profile = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  phone_verified: boolean;
  role: "customer" | "admin" | "super_admin";
  plan: "free" | "monthly" | "annual";
  credits: number;
  status: "active" | "suspended";
};

// Fetches the signed-in user's profile row. Assumes middleware has already
// redirected unauthenticated requests away from the calling route.
export async function requireProfile(): Promise<Profile> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, name, email, phone, phone_verified, role, plan, credits, status")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");
  if (profile.status === "suspended") redirect("/login?error=Your account has been suspended");

  return profile as Profile;
}

export async function requireAdminProfile(): Promise<Profile> {
  const profile = await requireProfile();
  if (profile.role !== "admin" && profile.role !== "super_admin") {
    redirect("/visualiser");
  }
  return profile;
}
