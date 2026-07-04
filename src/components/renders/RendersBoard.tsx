"use client";

import { useTransition } from "react";
import Link from "next/link";
import { Bookmark, BookmarkX, Trash2, Clock, FolderOpen, Plus, Download } from "lucide-react";
import type { RenderRow } from "@/lib/data/renders";
import { saveRender, unsaveRender, deleteRender } from "@/lib/actions/renders";
import { logDownload } from "@/lib/actions/downloads";
import { ShareMenu } from "@/components/share/ShareMenu";
import { triggerImageDownload } from "@/lib/images/download";

function hoursUntil(iso: string) {
  return (new Date(iso).getTime() - Date.now()) / 3_600_000;
}

export function RendersBoard({
  renders,
  maxSavedProjects,
}: {
  renders: RenderRow[];
  maxSavedProjects: number;
}) {
  const [isPending, startTransition] = useTransition();

  async function handleDownload(url: string, stoneName: string | undefined, renderId: string) {
    try {
      const stonePart = stoneName ? stoneName.toLowerCase().replace(/[^a-z0-9]+/g, "-") : "render";
      await triggerImageDownload(url, `ratedworktops-${stonePart}.png`);
      void logDownload(renderId);
    } catch (err) {
      console.error("Failed to download image:", err);
    }
  }

  const saved = renders.filter((r) => r.is_saved);
  const temporary = renders.filter((r) => !r.is_saved);

  return (
    <div className="mt-6 flex flex-col gap-10">
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-white/50">Saved Projects</h2>
          <span className="rounded-full border border-panel-border bg-white/5 px-3 py-1 text-xs font-semibold text-brand-gold">
            {saved.length} / {maxSavedProjects} slots used
          </span>
        </div>

        {saved.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-panel-border py-16 text-center">
            <FolderOpen className="h-10 w-10 text-white/20" />
            <p className="text-base font-semibold text-white">No Saved Projects Yet</p>
            <p className="max-w-sm text-sm text-white/40">
              Create a kitchen visualisation in the workspace and save it here to keep it permanently.
            </p>
            <Link
              href="/visualiser"
              className="mt-2 flex items-center gap-2 rounded-lg bg-gradient-to-b from-brand-gold to-brand-gold-dark px-5 py-2.5 text-sm font-semibold text-black"
            >
              <Plus className="h-4 w-4" /> New Visualisation
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {saved.map((render) => (
              <div key={render.id} className="overflow-hidden rounded-xl border border-panel-border bg-white/5">
                <img
                  src={render.result_image_url ?? render.source_image_url}
                  alt={render.name ?? "Saved kitchen render"}
                  className="aspect-square w-full object-cover"
                />
                <div className="flex items-center justify-between p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">
                      {render.stone_colours?.name ?? "Custom render"}
                    </p>
                    <p className="text-xs text-white/40">{new Date(render.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-1">
                      <button
                        onClick={() => render.watermarked_image_url && handleDownload(render.watermarked_image_url, render.stone_colours?.name, render.id)}
                        title="Download"
                        className="rounded-md p-1.5 text-white/40 hover:bg-white/10 hover:text-white cursor-pointer"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    <button
                      disabled={isPending}
                      onClick={() => startTransition(() => void unsaveRender(render.id))}
                      title="Remove from saved (moves back to temporary)"
                      className="rounded-md p-1.5 text-white/40 hover:bg-white/10 hover:text-white"
                    >
                      <BookmarkX className="h-4 w-4" />
                    </button>
                    <button
                      disabled={isPending}
                      onClick={() => startTransition(() => void deleteRender(render.id))}
                      title="Delete permanently"
                      className="rounded-md p-1.5 text-white/40 hover:bg-red-500/10 hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {render.watermarked_image_url && (
                  <div className="border-t border-panel-border p-2">
                    <ShareMenu renderId={render.id} imageUrl={render.watermarked_image_url} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {temporary.length > 0 && (
        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white/50">
            Recent Renders (temporary)
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {temporary.map((render) => {
              const hoursLeft = render.expires_at ? hoursUntil(render.expires_at) : null;
              const expiringSoon = hoursLeft !== null && hoursLeft < 6;
              return (
                <div key={render.id} className="overflow-hidden rounded-xl border border-panel-border bg-white/5">
                  <div className="relative">
                    <img
                      src={render.result_image_url ?? render.source_image_url}
                      alt={render.name ?? "Recent kitchen render"}
                      className="aspect-square w-full object-cover"
                    />
                    {hoursLeft !== null && (
                      <span
                        className={`absolute right-2 top-2 flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold ${
                          expiringSoon ? "bg-red-500/90 text-white" : "bg-black/70 text-white/80"
                        }`}
                      >
                        <Clock className="h-3 w-3" />
                        {hoursLeft <= 0 ? "Expired" : `${Math.max(1, Math.round(hoursLeft))}h left`}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between p-3">
                    <p className="truncate text-sm font-medium text-white">
                      {render.stone_colours?.name ?? "Custom render"}
                    </p>
                    <button
                      disabled={isPending}
                      onClick={() => startTransition(() => void saveRender(render.id))}
                      title="Save permanently"
                      className="rounded-md p-1.5 text-brand-gold hover:bg-brand-gold/10"
                    >
                      <Bookmark className="h-4 w-4" />
                    </button>
                  </div>
                  {expiringSoon && (
                    <p className="border-t border-panel-border bg-red-500/5 px-3 py-2 text-[11px] text-red-400">
                      This render will be permanently deleted soon. Save it to keep it.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
