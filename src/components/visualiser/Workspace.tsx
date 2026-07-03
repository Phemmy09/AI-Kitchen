"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { Upload, Sparkles, Loader2, Search, Download, Bookmark, RotateCcw, Zap } from "lucide-react";
import type { Brand, Category, StoneColour } from "@/lib/data/stones";
import { saveRender } from "@/lib/actions/renders";
import { ShareMenu } from "@/components/share/ShareMenu";

type FlatColour = StoneColour & { brandName: string; categoryId: string | null };

export function Workspace({
  initialCredits,
  categories,
  brands,
  initialStoneId,
}: {
  initialCredits: number;
  categories: Category[];
  brands: Brand[];
  initialStoneId?: string;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [refinement, setRefinement] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [watermarkedUrl, setWatermarkedUrl] = useState<string | null>(null);
  const [renderId, setRenderId] = useState<string | null>(null);
  const [credits, setCredits] = useState(initialCredits);

  const [saveState, setSaveState] = useState<"idle" | "saved" | "limit">("idle");
  const [isSaving, startSaving] = useTransition();

  const flatColours: FlatColour[] = useMemo(
    () =>
      brands.flatMap((brand) =>
        brand.stone_colours.map((c) => ({ ...c, brandName: brand.name, categoryId: brand.category_id })),
      ),
    [brands],
  );

  const [selectedColour, setSelectedColour] = useState<FlatColour | null>(
    () => flatColours.find((c) => c.id === initialStoneId) ?? null,
  );

  const filteredColours = flatColours.filter((c) => {
    const matchesSearch =
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.brandName.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || c.categoryId === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  function handleFileChange(selected: File | null) {
    setError(null);
    setResultUrl(null);
    setSaveState("idle");
    setFile(selected);
    setPreviewUrl(selected ? URL.createObjectURL(selected) : null);
  }

  function handleClear() {
    handleFileChange(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleGenerate() {
    if (!file || !selectedColour) return;
    setIsGenerating(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("stoneColourId", selectedColour.id);
      formData.append("refinement", refinement);

      const res = await fetch("/api/generate", { method: "POST", body: formData });
      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? "Something went wrong. Please try again.");
        return;
      }

      setResultUrl(json.resultImageUrl);
      setWatermarkedUrl(json.watermarkedImageUrl);
      setRenderId(json.renderId);
      setCredits(json.creditsRemaining);
    } catch {
      setError("Network error - please check your connection and try again.");
    } finally {
      setIsGenerating(false);
    }
  }

  function handleSave() {
    if (!renderId) return;
    startSaving(async () => {
      const result = await saveRender(renderId);
      if ("limitReached" in result) setSaveState("limit");
      else if ("success" in result) setSaveState("saved");
      else setError(result.error);
    });
  }

  const displayImage = resultUrl ?? previewUrl;

  return (
    <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-6 py-8 lg:grid-cols-[280px_1fr_300px]">
      {/* Stone catalog sidebar */}
      <aside className="order-2 flex flex-col gap-3 lg:order-1">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search stones by name..."
            className="w-full rounded-lg border border-panel-border bg-white/5 py-2 pl-9 pr-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-brand-gold"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="w-full rounded-lg border border-panel-border bg-white/5 px-3 py-2 text-sm text-white outline-none"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        <div className="flex max-h-[70vh] flex-col gap-2 overflow-y-auto pr-1">
          {filteredColours.map((colour) => (
            <button
              key={colour.id}
              onClick={() => setSelectedColour(colour)}
              className={`group flex items-center gap-3 rounded-lg border p-2 text-left transition-all duration-200 active:scale-[0.98] ${
                selectedColour?.id === colour.id
                  ? "animate-scale-in border-brand-gold bg-brand-gold/10 shadow-[0_8px_40px_rgba(201,169,110,0.18)]"
                  : "border-panel-border bg-white/5 hover:-translate-y-0.5 hover:bg-white/10"
              }`}
            >
              <span className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-md bg-white/10">
                <Image
                  src={colour.texture_url}
                  alt={colour.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                  unoptimized
                />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-white">{colour.name}</span>
                <span className="block truncate text-xs text-white/40">
                  {colour.brandName}
                  {colour.finish ? ` · ${colour.finish}` : ""}
                </span>
              </span>
            </button>
          ))}
          {filteredColours.length === 0 && (
            <p className="p-4 text-center text-sm text-white/30">No stones match your search.</p>
          )}
        </div>
      </aside>

      {/* Main workspace */}
      <section className="order-1 flex flex-col gap-4 lg:order-2">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-xl font-bold">Workspace</h1>
          {file && (
            <button onClick={handleClear} className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white">
              <RotateCcw className="h-3.5 w-3.5" /> Clear
            </button>
          )}
        </div>

        <div className="group flex min-h-[420px] flex-1 items-center justify-center rounded-2xl border border-dashed border-panel-border bg-white/[0.02] transition-colors duration-300 has-[label]:hover:border-[color:var(--border-gold)]">
          {!displayImage ? (
            <label className="flex cursor-pointer flex-col items-center gap-3 p-10 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/5 transition-transform duration-300 group-hover:-translate-y-1">
                <Upload className="h-6 w-6 text-brand-gold" />
              </span>
              <span className="text-base font-semibold text-white">Upload your kitchen</span>
              <span className="text-sm text-white/40">JPG, PNG or WEBP, up to 10MB</span>
              <span className="mt-2 rounded-lg bg-gradient-to-b from-brand-gold to-brand-gold-dark px-5 py-2.5 text-sm font-semibold text-black shadow-[0_2px_12px_rgba(201,169,110,0.3)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_40px_rgba(201,169,110,0.18)]">
                Choose file
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
              />
            </label>
          ) : (
            <div className="relative h-full w-full">
              <img src={displayImage} alt="Kitchen preview" className="max-h-[70vh] w-full rounded-2xl object-contain" />
              {isGenerating && (
                <div className="animate-scale-in absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-2xl bg-black/70 backdrop-blur-sm">
                  <div className="pulse-ring flex h-14 w-14 items-center justify-center rounded-full bg-brand-gold/10">
                    <Loader2 className="h-6 w-6 animate-spin text-brand-gold" />
                  </div>
                  <p className="text-sm text-white/70">Detecting surfaces &amp; rendering stone...</p>
                </div>
              )}
            </div>
          )}
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
            {error.toLowerCase().includes("out of credits") && (
              <>
                {" "}
                <Link href="/credits" className="font-semibold underline">
                  Get more credits
                </Link>
              </>
            )}
          </div>
        )}

        {saveState === "limit" && (
          <div className="rounded-lg border border-brand-gold/30 bg-brand-gold/10 px-4 py-3 text-sm text-brand-gold">
            You&apos;ve reached your saved project limit.{" "}
            <Link href="/my-renders" className="underline">
              Free up a slot
            </Link>{" "}
            or{" "}
            <Link href="/credits" className="underline">
              upgrade your plan
            </Link>{" "}
            for more storage.
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          {!resultUrl ? (
            <button
              onClick={handleGenerate}
              disabled={!file || !selectedColour || isGenerating}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-b from-brand-gold to-brand-gold-dark px-5 py-3 text-sm font-semibold text-black transition disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Sparkles className="h-4 w-4" />
              {isGenerating ? "Generating..." : "Generate AI Render"}
            </button>
          ) : (
            <>
              <button
                onClick={handleSave}
                disabled={isSaving || saveState === "saved"}
                className="flex items-center gap-2 rounded-lg border border-panel-border bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-60"
              >
                <Bookmark className="h-4 w-4" />
                {saveState === "saved" ? "Saved to My Renders" : isSaving ? "Saving..." : "Save to Projects"}
              </button>
              <a
                href={watermarkedUrl ?? resultUrl}
                download
                className="flex items-center gap-2 rounded-lg border border-panel-border bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                <Download className="h-4 w-4" /> Download
              </a>
              {renderId && <ShareMenu renderId={renderId} imageUrl={watermarkedUrl ?? resultUrl} />}
            </>
          )}
        </div>
      </section>

      {/* Options panel */}
      <aside className="order-3 flex flex-col gap-5">
        <div className="rounded-xl border border-panel-border bg-white/5 p-4">
          <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-white/40">
            <Zap className="h-3.5 w-3.5 text-brand-gold" /> Credits
          </p>
          <p className="text-2xl font-bold text-white">{credits}</p>
        </div>

        <div className="rounded-xl border border-panel-border bg-white/5 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/40">Detection</p>
          <p className="text-sm text-white/60">
            AI automatically detects the worktop, splashback and island surfaces in your photo - no manual
            outlining needed.
          </p>
        </div>

        <div className="rounded-xl border border-panel-border bg-white/5 p-4">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-white/40">
            Refinement (optional)
          </label>
          <textarea
            value={refinement}
            onChange={(e) => setRefinement(e.target.value)}
            placeholder="e.g. Only the island worktop, leave the wall area alone."
            rows={3}
            className="w-full resize-none rounded-lg border border-panel-border bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-brand-gold"
          />
        </div>

        <div className="rounded-xl border border-panel-border bg-white/5 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/40">Selected Stone</p>
          {selectedColour ? (
            <div className="flex items-center gap-3">
              <span className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md bg-white/10">
                <Image src={selectedColour.texture_url} alt={selectedColour.name} fill className="object-cover" unoptimized />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">{selectedColour.name}</p>
                <p className="truncate text-xs text-white/40">{selectedColour.brandName}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-white/30">Pick a stone from the catalog on the left.</p>
          )}
        </div>
      </aside>
    </div>
  );
}
