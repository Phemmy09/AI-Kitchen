import { requireProfile } from "@/lib/data/profile";
import { getUserRenders, getMaxSavedProjects } from "@/lib/data/renders";
import { RendersBoard } from "@/components/renders/RendersBoard";

export default async function MyRendersPage() {
  const profile = await requireProfile();
  const [renders, maxSavedProjects] = await Promise.all([
    getUserRenders(profile.id),
    getMaxSavedProjects(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">My Projects</h1>
          <p className="mt-1 text-sm text-white/50">Access and manage your saved kitchen visual designs.</p>
        </div>
      </div>

      <RendersBoard renders={renders} maxSavedProjects={maxSavedProjects} />
    </div>
  );
}
