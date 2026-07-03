"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Eye, EyeOff, ChevronUp, ChevronDown } from "lucide-react";
import type { Category } from "@/lib/data/stones";
import { createCategory, toggleCategoryEnabled, deleteCategory, reorderCategory } from "@/lib/actions/admin/categories";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

type CategoryWithCount = Category & { brandCount: number };

export function CategoriesManager({ categories }: { categories: CategoryWithCount[] }) {
  const [isPending, startTransition] = useTransition();
  const [newName, setNewName] = useState("");
  const [pendingDelete, setPendingDelete] = useState<CategoryWithCount | null>(null);

  return (
    <div className="mt-6 max-w-2xl">
      <form
        action={() => {
          if (!newName.trim()) return;
          const fd = new FormData();
          fd.set("name", newName);
          startTransition(async () => {
            await createCategory(fd);
            setNewName("");
          });
        }}
        className="mb-4 flex gap-2"
      >
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New category name"
          className="admin-input flex-1"
        />
        <button
          disabled={isPending}
          className="flex items-center gap-1.5 rounded-lg bg-gradient-to-b from-brand-gold to-brand-gold-dark px-4 py-2 text-sm font-semibold text-black shadow-[0_2px_12px_rgba(201,169,110,0.3)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_40px_rgba(201,169,110,0.18)]"
        >
          <Plus className="h-4 w-4" /> Add Category
        </button>
      </form>

      <AnimatePresence initial={false}>
        <div className="flex flex-col gap-2">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              layout
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              className="gold-edge flex items-center justify-between rounded-lg border border-panel-border bg-white/5 p-3 transition-colors duration-200 hover:border-[color:var(--border-gold)]"
            >
              <div className="flex items-center gap-3">
                <div className="flex flex-col">
                  <button
                    disabled={isPending || i === 0}
                    onClick={() => startTransition(() => void reorderCategory(cat.id, "up"))}
                    className="text-white/30 transition-colors hover:text-white disabled:opacity-20"
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    disabled={isPending || i === categories.length - 1}
                    onClick={() => startTransition(() => void reorderCategory(cat.id, "down"))}
                    className="text-white/30 transition-colors hover:text-white disabled:opacity-20"
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{cat.name}</p>
                  <p className="text-xs text-white/40">{cat.brandCount} brand(s)</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={isPending}
                  onClick={() => startTransition(() => void toggleCategoryEnabled(cat.id, !cat.enabled))}
                  className="flex items-center gap-1 rounded-md border border-panel-border px-2 py-1 text-xs text-white/60 transition-colors hover:bg-white/10"
                >
                  {cat.enabled ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                  {cat.enabled ? "Enabled" : "Disabled"}
                </button>
                <button
                  disabled={isPending}
                  onClick={() => setPendingDelete(cat)}
                  className="rounded-md p-1.5 text-white/40 transition-colors hover:bg-red-500/10 hover:text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </AnimatePresence>

      <ConfirmModal
        open={pendingDelete !== null}
        title="Delete this category?"
        description={`Delete category "${pendingDelete?.name}"? Brands assigned to it will become uncategorised.`}
        confirmLabel="Delete"
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) startTransition(() => void deleteCategory(pendingDelete.id));
          setPendingDelete(null);
        }}
      />
    </div>
  );
}
