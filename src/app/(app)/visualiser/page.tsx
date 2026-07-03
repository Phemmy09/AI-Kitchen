import { getStoneCatalog } from "@/lib/data/stones";
import { requireProfile } from "@/lib/data/profile";
import { Workspace } from "@/components/visualiser/Workspace";

export default async function VisualiserPage({
  searchParams,
}: {
  searchParams: Promise<{ stone?: string }>;
}) {
  const [profile, { categories, brands }, params] = await Promise.all([
    requireProfile(),
    getStoneCatalog(),
    searchParams,
  ]);

  return (
    <Workspace
      initialCredits={profile.credits}
      categories={categories}
      brands={brands}
      initialStoneId={params.stone}
    />
  );
}
