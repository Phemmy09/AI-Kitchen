"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";
import type { Brand, Category } from "@/lib/data/stones";

export function StoneGrid({ categories, brands }: { categories: Category[]; brands: Brand[] }) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [brandFilter, setBrandFilter] = useState("all");

  const items = useMemo(
    () =>
      brands.flatMap((brand) =>
        brand.stone_colours.map((colour) => ({ colour, brand })),
      ),
    [brands],
  );

  const filtered = items.filter(({ colour, brand }) => {
    const matchesSearch =
      !search ||
      colour.name.toLowerCase().includes(search.toLowerCase()) ||
      brand.name.toLowerCase().includes(search.toLowerCase()) ||
      (colour.sku ?? "").toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || brand.category_id === categoryFilter;
    const matchesBrand = brandFilter === "all" || brand.id === brandFilter;
    return matchesSearch && matchesCategory && matchesBrand;
  });

  return (
    <div className="mt-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search stone name or SKU..."
            className="w-full rounded-lg border border-panel-border bg-white/5 py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-brand-gold"
          />
        </div>
        <select
          value={brandFilter}
          onChange={(e) => setBrandFilter(e.target.value)}
          className="rounded-lg border border-panel-border bg-white/5 px-3 py-2.5 text-sm text-white outline-none"
        >
          <option value="all">All Brands</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
        <span className="text-sm text-white/40">{filtered.length} materials found</span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => setCategoryFilter("all")}
          className={`rounded-full border px-3 py-1.5 text-sm ${
            categoryFilter === "all"
              ? "border-brand-gold bg-brand-gold/10 text-brand-gold"
              : "border-panel-border text-white/60 hover:text-white"
          }`}
        >
          All Materials
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategoryFilter(cat.id)}
            className={`rounded-full border px-3 py-1.5 text-sm ${
              categoryFilter === cat.id
                ? "border-brand-gold bg-brand-gold/10 text-brand-gold"
                : "border-panel-border text-white/60 hover:text-white"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {filtered.map(({ colour, brand }) => (
          <Link
            key={colour.id}
            href={`/visualiser?stone=${colour.id}`}
            className="group overflow-hidden rounded-xl border border-panel-border bg-white/5 transition-all duration-200 hover:-translate-y-1 hover:border-[color:var(--border-gold)] hover:shadow-[0_8px_40px_rgba(201,169,110,0.18)]"
          >
            <div className="relative aspect-square w-full overflow-hidden">
              <Image
                src={colour.texture_url}
                alt={colour.name}
                fill
                unoptimized
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              />
            </div>
            <div className="p-3">
              <p className="truncate text-sm font-semibold text-white">{colour.name}</p>
              <p className="truncate text-xs text-white/40">{brand.name}</p>
              {colour.sku && <p className="mt-1 text-[10px] uppercase tracking-wide text-brand-gold">{colour.sku}</p>}
            </div>
          </Link>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full py-12 text-center text-sm text-white/30">No stones match your filters.</p>
        )}
      </div>
    </div>
  );
}
