"use client";

import { useState, useTransition } from "react";
import { ChevronDown, Plus, Trash2, Eye, EyeOff, Upload } from "lucide-react";
import type { Brand, Category } from "@/lib/data/stones";
import {
  createBrand,
  toggleBrandEnabled,
  deleteBrand,
  createColour,
  toggleColourEnabled,
  deleteColour,
  bulkCreateColours,
} from "@/lib/actions/admin/stones";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

export function StoneLibraryManager({ categories, brands }: { categories: Category[]; brands: Brand[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showAddBrand, setShowAddBrand] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [pendingDeleteBrand, setPendingDeleteBrand] = useState<Brand | null>(null);

  return (
    <div className="mt-6">
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setShowAddBrand((v) => !v)}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-b from-brand-gold to-brand-gold-dark px-4 py-2 text-sm font-semibold text-black"
        >
          <Plus className="h-4 w-4" /> Add Brand
        </button>
        <button
          onClick={() => setShowBulk((v) => !v)}
          className="flex items-center gap-2 rounded-lg border border-panel-border bg-white/5 px-4 py-2 text-sm font-semibold text-white"
        >
          <Upload className="h-4 w-4" /> Bulk Import Colours
        </button>
      </div>

      {showAddBrand && (
        <form
          action={(fd) => startTransition(async () => { await createBrand(fd); setShowAddBrand(false); })}
          className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-panel-border bg-white/5 p-4"
        >
          <FieldGroup label="Name">
            <input name="name" required className="admin-input" placeholder="e.g. Silestone" />
          </FieldGroup>
          <FieldGroup label="Category">
            <select name="categoryId" className="admin-input">
              <option value="">None</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </FieldGroup>
          <FieldGroup label="Description">
            <input name="description" className="admin-input" placeholder="Short description" />
          </FieldGroup>
          <button disabled={isPending} className="rounded-lg bg-brand-gold px-4 py-2 text-sm font-semibold text-black">
            Create
          </button>
        </form>
      )}

      {showBulk && (
        <form
          action={(fd) => startTransition(async () => { await bulkCreateColours(fd); setShowBulk(false); })}
          className="mb-4 flex flex-col gap-3 rounded-xl border border-panel-border bg-white/5 p-4"
        >
          <p className="text-xs text-white/50">
            One colour per line: <code className="text-brand-gold">brandId,name,sku,finish,textureUrl</code>
          </p>
          <textarea
            name="csv"
            rows={5}
            required
            className="admin-input font-mono text-xs"
            placeholder={`${brands[0]?.id ?? "brand-uuid"},Calacatta Gold,CAL-GD,polished,https://.../texture.jpg`}
          />
          <button disabled={isPending} className="self-start rounded-lg bg-brand-gold px-4 py-2 text-sm font-semibold text-black">
            Import
          </button>
        </form>
      )}

      <div className="flex flex-col gap-3">
        {brands.map((brand) => (
          <div key={brand.id} className="rounded-xl border border-panel-border bg-white/5">
            <button
              onClick={() => setExpanded(expanded === brand.id ? null : brand.id)}
              className="flex w-full items-center justify-between p-4 text-left"
            >
              <div>
                <p className="font-semibold text-white">{brand.name}</p>
                <p className="text-xs text-white/40">
                  {brand.stone_colours.length} colours ({brand.stone_colours.filter((c) => c.enabled).length} active)
                  {brand.description ? ` · ${brand.description}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-xs ${brand.enabled ? "bg-emerald-500/10 text-emerald-400" : "bg-white/10 text-white/40"}`}>
                  {brand.enabled ? "Active" : "Disabled"}
                </span>
                <ChevronDown className={`h-4 w-4 text-white/40 transition ${expanded === brand.id ? "rotate-180" : ""}`} />
              </div>
            </button>

            {expanded === brand.id && (
              <div className="border-t border-panel-border p-4">
                <div className="mb-4 flex gap-2">
                  <button
                    disabled={isPending}
                    onClick={() => startTransition(() => void toggleBrandEnabled(brand.id, !brand.enabled))}
                    className="flex items-center gap-1.5 rounded-md border border-panel-border px-3 py-1.5 text-xs text-white/70 hover:bg-white/10"
                  >
                    {brand.enabled ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    {brand.enabled ? "Disable brand" : "Enable brand"}
                  </button>
                  <button
                    disabled={isPending}
                    onClick={() => setPendingDeleteBrand(brand)}
                    className="flex items-center gap-1.5 rounded-md border border-red-500/30 px-3 py-1.5 text-xs text-red-400 transition-colors hover:bg-red-500/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete brand
                  </button>
                </div>

                <AddColourForm brandId={brand.id} />

                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {brand.stone_colours.map((colour) => (
                    <div key={colour.id} className="overflow-hidden rounded-lg border border-panel-border">
                      <img src={colour.texture_url} alt={colour.name} className="aspect-square w-full object-cover" />
                      <div className="p-2">
                        <p className="truncate text-xs font-medium text-white">{colour.name}</p>
                        <div className="mt-1 flex items-center justify-between">
                          <span
                            className={`text-[10px] ${colour.enabled ? "text-emerald-400" : "text-white/30"}`}
                          >
                            {colour.enabled ? "Active" : "Disabled"}
                          </span>
                          <div className="flex gap-1">
                            <button
                              disabled={isPending}
                              onClick={() => startTransition(() => void toggleColourEnabled(colour.id, !colour.enabled))}
                              className="text-white/40 hover:text-white"
                            >
                              {colour.enabled ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                            </button>
                            <button
                              disabled={isPending}
                              onClick={() => startTransition(() => void deleteColour(colour.id))}
                              className="text-white/40 hover:text-red-400"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <ConfirmModal
        open={pendingDeleteBrand !== null}
        title="Delete this brand?"
        description={`Delete ${pendingDeleteBrand?.name} and all its colours? This cannot be undone.`}
        confirmLabel="Delete"
        onCancel={() => setPendingDeleteBrand(null)}
        onConfirm={() => {
          if (pendingDeleteBrand) startTransition(() => void deleteBrand(pendingDeleteBrand.id));
          setPendingDeleteBrand(null);
        }}
      />
    </div>
  );
}

function AddColourForm({ brandId }: { brandId: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <form
      action={(fd) => startTransition(() => void createColour(fd))}
      className="flex flex-wrap items-end gap-2 rounded-lg border border-dashed border-panel-border p-3"
    >
      <input type="hidden" name="brandId" value={brandId} />
      <FieldGroup label="Name">
        <input name="name" required className="admin-input w-32" placeholder="Colour name" />
      </FieldGroup>
      <FieldGroup label="SKU">
        <input name="sku" className="admin-input w-24" />
      </FieldGroup>
      <FieldGroup label="Finish">
        <input name="finish" className="admin-input w-24" placeholder="Polished" />
      </FieldGroup>
      <FieldGroup label="Texture">
        <input type="file" name="texture" accept="image/*" required className="text-xs text-white/60" />
      </FieldGroup>
      <button disabled={isPending} className="rounded-lg bg-brand-gold px-3 py-2 text-xs font-semibold text-black">
        Add Colour
      </button>
    </form>
  );
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-xs text-white/40">
      {label}
      {children}
    </label>
  );
}
