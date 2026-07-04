"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  Pencil,
  Check,
  X,
  ChevronUp,
  ChevronDown,
  Gem,
  Mountain,
  Diamond,
  Hexagon,
  Square,
  Layers,
  Circle,
  Droplet,
  Waves,
  Info,
  BarChart3,
} from "lucide-react";
import type { Category } from "@/lib/data/stones";
import {
  createCategory,
  toggleCategoryEnabled,
  deleteCategory,
  reorderCategory,
  updateCategory,
} from "@/lib/actions/admin/categories";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Switch } from "@/components/ui/Switch";

type CategoryWithCount = Category & { brandCount: number };

const ICONS = { gem: Gem, mountain: Mountain, diamond: Diamond, hexagon: Hexagon, square: Square, layers: Layers, circle: Circle, droplet: Droplet, waves: Waves } as const;
const ICON_KEYS = Object.keys(ICONS) as (keyof typeof ICONS)[];

function iconFor(icon: string | null) {
  return ICONS[(icon ?? "gem") as keyof typeof ICONS] ?? Gem;
}

export function CategoriesManager({ categories }: { categories: CategoryWithCount[] }) {
  const [isPending, startTransition] = useTransition();
  const [newName, setNewName] = useState("");
  const [pendingDelete, setPendingDelete] = useState<CategoryWithCount | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editIcon, setEditIcon] = useState<string>("gem");

  const totalCount = categories.length;
  const enabledCount = categories.filter((c) => c.enabled).length;

  function startEdit(cat: CategoryWithCount) {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditIcon(cat.icon ?? "gem");
  }

  function saveEdit() {
    if (!editingId || !editName.trim()) return;
    startTransition(() => void updateCategory(editingId, { name: editName.trim(), icon: editIcon }));
    setEditingId(null);
  }

  return (
    <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
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
            {categories.map((cat, i) => {
              const Icon = iconFor(cat.icon);
              const isEditing = editingId === cat.id;
              return (
                <motion.div
                  key={cat.id}
                  layout
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                  className="gold-edge flex items-center justify-between rounded-lg border border-panel-border bg-white/5 p-3 transition-colors duration-200 hover:border-[color:var(--border-gold)]"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
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

                    <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-brand-gold/10 text-brand-gold">
                      <Icon className="h-4.5 w-4.5" />
                    </span>

                    {isEditing ? (
                      <div className="flex min-w-0 flex-1 items-center gap-2">
                        <input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="admin-input min-w-0 flex-1 py-1.5"
                          autoFocus
                        />
                        <select
                          value={editIcon}
                          onChange={(e) => setEditIcon(e.target.value)}
                          className="admin-input w-28 py-1.5 text-xs"
                        >
                          {ICON_KEYS.map((key) => (
                            <option key={key} value={key}>
                              {key}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-white">{cat.name}</p>
                        <p className="text-xs text-white/40">{cat.brandCount} brand(s)</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-shrink-0 items-center gap-2">
                    {isEditing ? (
                      <>
                        <button
                          disabled={isPending}
                          onClick={saveEdit}
                          className="rounded-md p-1.5 text-emerald-400 transition-colors hover:bg-emerald-500/10"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="rounded-md p-1.5 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <Switch
                          checked={cat.enabled}
                          disabled={isPending}
                          onClick={() => startTransition(() => void toggleCategoryEnabled(cat.id, !cat.enabled))}
                        />
                        <button
                          disabled={isPending}
                          onClick={() => startEdit(cat)}
                          className="rounded-md p-1.5 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          disabled={isPending}
                          onClick={() => setPendingDelete(cat)}
                          className="rounded-md p-1.5 text-white/40 transition-colors hover:bg-red-500/10 hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </AnimatePresence>
      </div>

      <div className="flex flex-col gap-4">
        <div className="rounded-xl border border-panel-border bg-white/5 p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
            <Info className="h-4 w-4 text-brand-gold" /> About Categories
          </h2>
          <p className="mt-3 text-sm text-white/50">
            Categories group stone brands and colours to help customers browse and filter the catalog.
          </p>
          <p className="mt-3 rounded-lg border border-brand-gold/20 bg-brand-gold/5 p-3 text-xs text-white/60">
            Disabled categories are hidden from customers but remain in the system.
          </p>
        </div>

        <div className="rounded-xl border border-panel-border bg-white/5 p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
            <BarChart3 className="h-4 w-4 text-brand-gold" /> Summary
          </h2>
          <div className="mt-3 flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-white/50">Total Categories</span>
              <span className="font-semibold text-white">{totalCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">Enabled</span>
              <span className="font-semibold text-emerald-400">{enabledCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">Disabled</span>
              <span className="font-semibold text-red-400">{totalCount - enabledCount}</span>
            </div>
          </div>
        </div>
      </div>

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
