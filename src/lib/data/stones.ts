import { createClient } from "@/lib/supabase/server";

export type StoneColour = {
  id: string;
  name: string;
  sku: string | null;
  texture_url: string;
  finish: string | null;
  enabled: boolean;
};

export type Brand = {
  id: string;
  name: string;
  logo_url: string | null;
  description: string | null;
  category_id: string | null;
  enabled: boolean;
  stone_colours: StoneColour[];
};

export type Category = {
  id: string;
  name: string;
  icon: string | null;
  sort_order: number;
  enabled: boolean;
};

// Public catalog: enabled categories/brands/colours only, for the
// visualiser sidebar and the customer-facing stone catalog page.
export async function getStoneCatalog(): Promise<{ categories: Category[]; brands: Brand[] }> {
  const supabase = await createClient();

  const [{ data: categories }, { data: brands }] = await Promise.all([
    supabase.from("categories").select("*").eq("enabled", true).order("sort_order"),
    supabase
      .from("brands")
      .select("*, stone_colours(*)")
      .eq("enabled", true)
      .order("name"),
  ]);

  const brandsWithEnabledColours = (brands ?? []).map((brand) => ({
    ...brand,
    stone_colours: (brand.stone_colours ?? []).filter((c: StoneColour) => c.enabled),
  }));

  return { categories: categories ?? [], brands: brandsWithEnabledColours };
}

// Admin view: everything, including disabled brands/colours.
export async function getAdminStoneCatalog(): Promise<{ categories: Category[]; brands: Brand[] }> {
  const supabase = await createClient();

  const [{ data: categories }, { data: brands }] = await Promise.all([
    supabase.from("categories").select("*").order("sort_order"),
    supabase.from("brands").select("*, stone_colours(*)").order("name"),
  ]);

  return { categories: categories ?? [], brands: (brands as Brand[]) ?? [] };
}
