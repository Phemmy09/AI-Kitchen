import { getAdminStoneCatalog } from "@/lib/data/stones";
import { StoneLibraryManager } from "@/components/admin/StoneLibraryManager";

export default async function AdminStonesPage() {
  const { categories, brands } = await getAdminStoneCatalog();
  const totalColours = brands.reduce((sum, b) => sum + b.stone_colours.length, 0);
  const activeColours = brands.reduce((sum, b) => sum + b.stone_colours.filter((c) => c.enabled).length, 0);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-white">Stone Library</h1>
      <p className="mt-1 text-sm text-white/50">
        {brands.length} brands · {activeColours}/{totalColours} active colours
      </p>

      <StoneLibraryManager categories={categories} brands={brands} />
    </div>
  );
}
