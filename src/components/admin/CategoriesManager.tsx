"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, Eye, EyeOff, ChevronUp, ChevronDown } from "lucide-react";
import type { Category } from "@/lib/data/stones";
import { createCategory, toggleCategoryEnabled, deleteCategory, reorderCategory } from "@/lib/actions/admin/categories";

type CategoryWithCount = Category & { brandCount: number };

export function CategoriesManager({ categories }: { categories: CategoryWithCount[] }) {
  const [isPending, startTransition] = useTransition();
  const [newName, setNewName] = useState("");

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
        <button disabled={isPending} className="flex items-center gap-1.5 rounded-lg bg-brand-gold px-4 py-2 text-sm font-semibold text-black">
          <Plus className="h-4 w-4" /> Add Category
        </button>
      </form>

      <div className="flex flex-col gap-2">
        {categories.map((cat, i) => (
          <div key={cat.id} className="flex items-center justify-between rounded-lg border border-panel-border bg-white/5 p-3">
            <div className="flex items-center gap-3">
              <div className="flex flex-col">
                <button
                  disabled={isPending || i === 0}
                  onClick={() => startTransition(() => void reorderCategory(cat.id, "up"))}
                  className="text-white/30 hover:text-white disabled:opacity-20"
                >
                  <ChevronUp className="h-3.5 w-3.5" />
                </button>
                <button
                  disabled={isPending || i === categories.length - 1}
                  onClick={() => startTransition(() => void reorderCategory(cat.id, "down"))}
                  className="text-white/30 hover:text-white disabled:opacity-20"
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
                className="flex items-center gap-1 rounded-md border border-panel-border px-2 py-1 text-xs text-white/60 hover:bg-white/10"
              >
                {cat.enabled ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                {cat.enabled ? "Enabled" : "Disabled"}
              </button>
              <button
                disabled={isPending}
                onClick={() => {
                  if (window.confirm(`Delete category "${cat.name}"?`)) {
                    startTransition(() => void deleteCategory(cat.id));
                  }
                }}
                className="rounded-md p-1.5 text-white/40 hover:bg-red-500/10 hover:text-red-400"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
