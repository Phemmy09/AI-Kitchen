"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { X, ImageIcon } from "lucide-react";
import type { AdminUserRow } from "@/lib/data/admin";
import type { RenderRow } from "@/lib/data/renders";
import { getUserDetail } from "@/lib/actions/admin/users";

export function UserDetailModal({ user, onClose }: { user: AdminUserRow | null; onClose: () => void }) {
  const [renders, setRenders] = useState<RenderRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setRenders(null);
      setError(null);
      return;
    }
    let cancelled = false;
    getUserDetail(user.id).then((result) => {
      if (cancelled) return;
      if ("error" in result) setError(result.error);
      else setRenders(result.renders);
    });
    return () => {
      cancelled = true;
    };
  }, [user]);

  return (
    <AnimatePresence>
      {user && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={onClose}
        >
          <motion.div
            className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-panel-border bg-panel p-6 shadow-2xl"
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-gold/20 text-sm font-bold text-brand-gold">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <div>
                  <p className="font-display text-base font-bold text-white">{user.name}</p>
                  <p className="text-xs text-white/40">{user.email}</p>
                </div>
              </div>
              <button onClick={onClose} className="rounded-md p-1.5 text-white/40 hover:bg-white/10 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat label="Role" value={user.role.replace("_", " ")} />
              <Stat label="Plan" value={user.plan} />
              <Stat label="Credits" value={user.credits} />
              <Stat label="Status" value={user.status} />
              <Stat label="Visualisations" value={user.visualisations_count} />
              <Stat label="Downloads" value={user.downloads_count} />
              <Stat label="Joined" value={new Date(user.created_at).toLocaleDateString()} />
              <Stat label="Last Active" value={new Date(user.last_active).toLocaleDateString()} />
            </div>

            <h3 className="mt-6 text-xs font-semibold uppercase tracking-wide text-white/40">Render History</h3>
            {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
            {!error && renders === null && <p className="mt-2 text-sm text-white/30">Loading...</p>}
            {renders !== null && renders.length === 0 && (
              <div className="mt-3 flex flex-col items-center gap-2 rounded-xl border border-dashed border-panel-border py-10 text-center">
                <ImageIcon className="h-8 w-8 text-white/20" />
                <p className="text-sm text-white/30">No visualisations generated yet.</p>
              </div>
            )}
            {renders && renders.length > 0 && (
              <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
                {renders.map((r) => (
                  <div key={r.id} className="overflow-hidden rounded-lg border border-panel-border bg-white/5">
                    <img
                      src={r.result_image_url ?? r.source_image_url}
                      alt={r.name ?? "Kitchen render"}
                      className="aspect-square w-full object-cover"
                    />
                    <p className="truncate p-1.5 text-[11px] text-white/50">{r.stone_colours?.name ?? "Custom"}</p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-panel-border bg-white/5 p-3">
      <p className="truncate text-sm font-semibold capitalize text-white">{value}</p>
      <p className="text-[10px] uppercase tracking-wide text-white/40">{label}</p>
    </div>
  );
}
