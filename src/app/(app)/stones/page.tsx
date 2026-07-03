import { getStoneCatalog } from "@/lib/data/stones";
import { StoneGrid } from "@/components/stones/StoneGrid";

export default async function StoneCatalogPage() {
  const { categories, brands } = await getStoneCatalog();

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <h1 className="font-display text-2xl font-bold text-white">Stone Collections</h1>
      <p className="mt-1 text-sm text-white/50">
        Browse our library of premium kitchen stone brands. Compare marble, granite, quartz and more.
      </p>

      <StoneGrid categories={categories} brands={brands} />
    </div>
  );
}
