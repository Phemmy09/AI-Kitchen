import { getAdminStoneCatalog } from "@/lib/data/stones";
import { CategoriesManager } from "@/components/admin/CategoriesManager";

export default async function AdminCategoriesPage() {
  const { categories, brands } = await getAdminStoneCatalog();
  const brandCounts = new Map<string, number>();
  brands.forEach((b) => {
    if (b.category_id) brandCounts.set(b.category_id, (brandCounts.get(b.category_id) ?? 0) + 1);
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-white">Categories</h1>
      <p className="mt-1 text-sm text-white/50">Group stone brands and colours for browsing and filtering.</p>

      <CategoriesManager
        categories={categories.map((c) => ({ ...c, brandCount: brandCounts.get(c.id) ?? 0 }))}
      />
    </div>
  );
}
