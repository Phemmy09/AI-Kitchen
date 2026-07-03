"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Zap, Check, Loader2 } from "lucide-react";
import type { Profile } from "@/lib/data/profile";
import type { PlatformSettings } from "@/lib/data/settings";
import { FormNotice, FormError } from "@/components/auth/AuthCard";

function formatPrice(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase() }).format(
    cents / 100,
  );
}

export function SubscriptionPanel({ profile, settings }: { profile: Profile; settings: PlatformSettings }) {
  const searchParams = useSearchParams();
  const [loadingPlan, setLoadingPlan] = useState<"monthly" | "annual" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleUpgrade(plan: "monthly" | "annual") {
    setLoadingPlan(plan);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Could not start checkout.");
        return;
      }
      window.location.href = json.url;
    } catch {
      setError("Network error - please try again.");
    } finally {
      setLoadingPlan(null);
    }
  }

  return (
    <div className="mt-6 flex flex-col gap-6">
      {searchParams.get("success") && <FormNotice message="You're upgraded! Credits have been added to your account." />}
      {searchParams.get("canceled") && <FormNotice message="Checkout was canceled - no charges were made." />}
      {error && <FormError message={error} />}

      <div className="rounded-2xl border border-brand-gold/30 bg-brand-gold/5 p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-gold">Current Plan</p>
        <p className="mt-1 font-display text-2xl font-bold capitalize text-white">{profile.plan} Plan</p>
        <div className="mt-4 flex items-center gap-2 text-white/70">
          <Zap className="h-4 w-4 text-brand-gold" />
          <span>{profile.credits} credits available</span>
        </div>
      </div>

      {!settings.subscriptions_enabled ? (
        <div className="rounded-2xl border border-panel-border bg-white/5 p-6 text-center">
          <p className="text-base font-semibold text-white">Unlimited Free Visualisations</p>
          <p className="mt-1 text-sm text-white/50">
            Subscriptions are currently disabled - every generation is free while this mode is active.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <PlanCard
            title="Monthly"
            price={formatPrice(settings.monthly_price_cents, settings.currency)}
            period="/month"
            credits={settings.monthly_credits}
            loading={loadingPlan === "monthly"}
            onSelect={() => handleUpgrade("monthly")}
          />
          <PlanCard
            title="Annual"
            price={formatPrice(settings.annual_price_cents, settings.currency)}
            period="/year"
            credits={settings.annual_credits}
            badge="Best value"
            loading={loadingPlan === "annual"}
            onSelect={() => handleUpgrade("annual")}
          />
        </div>
      )}
    </div>
  );
}

function PlanCard({
  title,
  price,
  period,
  credits,
  badge,
  loading,
  onSelect,
}: {
  title: string;
  price: string;
  period: string;
  credits: number;
  badge?: string;
  loading: boolean;
  onSelect: () => void;
}) {
  return (
    <div className="relative rounded-2xl border border-panel-border bg-white/5 p-6">
      {badge && (
        <span className="absolute -top-3 left-6 rounded-full bg-gradient-to-b from-brand-gold to-brand-gold-dark px-3 py-1 text-[10px] font-bold uppercase text-black">
          {badge}
        </span>
      )}
      <p className="font-display text-lg font-bold text-white">{title}</p>
      <p className="mt-2 text-3xl font-bold text-white">
        {price}
        <span className="text-sm font-normal text-white/40">{period}</span>
      </p>
      <p className="mt-1 flex items-center gap-1.5 text-sm text-white/60">
        <Check className="h-4 w-4 text-brand-gold" /> {credits} visualisation credits
      </p>
      <button
        onClick={onSelect}
        disabled={loading}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-b from-brand-gold to-brand-gold-dark px-5 py-3 text-sm font-semibold text-black disabled:opacity-60"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {loading ? "Redirecting..." : `Upgrade to ${title}`}
      </button>
    </div>
  );
}
