"use client";

import { useActionState, useRef, useState } from "react";
import { Lightbulb } from "lucide-react";
import { updatePlatformSettings } from "@/lib/actions/admin/settings";
import type { AdminActionResult } from "@/lib/actions/admin/users";
import type { PlatformSettings } from "@/lib/data/settings";
import { FormError, FormNotice } from "@/components/auth/AuthCard";
import { Button } from "@/components/ui/Button";

const initialState: AdminActionResult | null = null;
const CURRENCY_SYMBOLS: Record<string, string> = { gbp: "£", usd: "$" };

export function SettingsForm({ settings }: { settings: PlatformSettings }) {
  const [state, formAction, isPending] = useActionState(
    async (_prev: AdminActionResult | null, formData: FormData) => updatePlatformSettings(formData),
    initialState,
  );
  const formRef = useRef<HTMLFormElement>(null);

  const [currency, setCurrency] = useState(settings.currency);
  const [monthlyPrice, setMonthlyPrice] = useState(settings.monthly_price_cents / 100);
  const [monthlyCredits, setMonthlyCredits] = useState(settings.monthly_credits);
  const [annualPrice, setAnnualPrice] = useState(settings.annual_price_cents / 100);
  const [annualCredits, setAnnualCredits] = useState(settings.annual_credits);

  const symbol = CURRENCY_SYMBOLS[currency] ?? currency.toUpperCase();
  const monthlyEquivalentAnnual = monthlyPrice * 12;
  const savingsPct = monthlyEquivalentAnnual > 0 ? Math.round((1 - annualPrice / monthlyEquivalentAnnual) * 100) : 0;

  function handleReset() {
    formRef.current?.reset();
    setCurrency(settings.currency);
    setMonthlyPrice(settings.monthly_price_cents / 100);
    setMonthlyCredits(settings.monthly_credits);
    setAnnualPrice(settings.annual_price_cents / 100);
    setAnnualCredits(settings.annual_credits);
  }

  return (
    <form ref={formRef} action={formAction} className="mt-6 flex max-w-3xl flex-col gap-6">
      <div className="sticky top-0 z-10 -mx-8 flex items-center justify-between border-b border-panel-border bg-[#0a0a0d]/95 px-8 py-3 backdrop-blur">
        <div className="text-sm text-white/40">Changes take effect immediately once saved.</div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="rounded-lg border border-panel-border bg-white/5 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            Reset to Saved
          </button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : "Save All Changes"}
          </Button>
        </div>
      </div>

      {state && "error" in state && <FormError message={state.error} />}
      {state && "success" in state && <FormNotice message="Settings saved." />}

      <div className="rounded-xl border border-panel-border bg-white/5 p-5">
        <h2 className="text-sm font-semibold text-white">Platform Mode</h2>
        <p className="mt-1 text-xs text-white/40">Control how customers access RatedWorktops.</p>
        <div className="mt-4 flex flex-col gap-4">
          <Toggle
            name="free_credits_enabled"
            label="Free Credits"
            defaultChecked={settings.free_credits_enabled}
            description="New customers receive free credits on registration."
          />
          <Toggle
            name="subscriptions_enabled"
            label="Subscription Plans"
            defaultChecked={settings.subscriptions_enabled}
            description="When disabled, every generation is free and unlimited."
          />
        </div>
      </div>

      <div className="rounded-xl border border-panel-border bg-white/5 p-5">
        <h2 className="text-sm font-semibold text-white">Free Credit Allowance</h2>
        <p className="mt-1 text-xs text-white/40">Number of free credits given to each new customer on registration.</p>
        <div className="mt-4 flex items-end gap-4">
          <Field label="Credits per new user" name="free_credit_amount" type="number" defaultValue={settings.free_credit_amount} />
          <p className="pb-2 text-xs text-white/40">
            Each credit = <span className="font-semibold text-brand-gold">1 visualisation</span>
          </p>
        </div>
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-brand-gold/20 bg-brand-gold/5 p-3 text-xs text-white/60">
          <Lightbulb className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-brand-gold" />
          <span>
            <span className="font-semibold text-brand-gold">Tip:</span> We recommend 5-15 free credits to let customers
            experience the tool before subscribing.
          </span>
        </div>
      </div>

      <div className="rounded-xl border border-panel-border bg-white/5 p-5">
        <h2 className="text-sm font-semibold text-white">Currency</h2>
        <p className="mt-1 text-xs text-white/40">Applies to pricing everywhere: this page, the homepage, and Stripe checkout.</p>
        <select
          name="currency"
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          className="admin-input mt-4 w-40 normal-case tracking-normal"
        >
          <option value="gbp">GBP (£)</option>
          <option value="usd">USD ($)</option>
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-panel-border bg-white/5 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Monthly Plan</h2>
          </div>
          <p className="mt-1 text-xs text-white/40">Billed every month. Cancel anytime.</p>
          <p className="mt-3 text-2xl font-bold text-white">
            {symbol}
            {monthlyPrice.toFixed(2)}
            <span className="text-sm font-normal text-white/40">/month</span>
          </p>
          <p className="text-sm font-semibold text-brand-gold">{monthlyCredits} credits / month</p>
          <div className="my-4 border-t border-panel-border" />
          <Field
            label={`Monthly price (${symbol})`}
            name="monthly_price"
            type="number"
            step="0.01"
            defaultValue={monthlyPrice.toFixed(2)}
            onValueChange={(v) => setMonthlyPrice(Number(v) || 0)}
          />
          <Field
            label="Credits per month"
            name="monthly_credits"
            type="number"
            defaultValue={monthlyCredits}
            onValueChange={(v) => setMonthlyCredits(Number(v) || 0)}
          />
        </div>
        <div className="relative rounded-xl border border-panel-border bg-white/5 p-5">
          {savingsPct > 0 && (
            <span className="absolute -top-3 right-5 rounded-full bg-gradient-to-b from-brand-gold to-brand-gold-dark px-3 py-1 text-[10px] font-bold uppercase text-black">
              Most Popular
            </span>
          )}
          <h2 className="text-sm font-semibold text-white">Annual Plan</h2>
          <p className="mt-1 text-xs text-white/40">Billed annually. Best value for regular users.</p>
          <p className="mt-3 text-2xl font-bold text-white">
            {symbol}
            {annualPrice.toFixed(2)}
            <span className="text-sm font-normal text-white/40">/year</span>
          </p>
          <p className="text-sm font-semibold text-brand-gold">{annualCredits} credits / year</p>
          {savingsPct > 0 && (
            <span className="mt-1 inline-block rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-400">
              Save {savingsPct}% vs monthly
            </span>
          )}
          <div className="my-4 border-t border-panel-border" />
          <Field
            label={`Annual price (${symbol})`}
            name="annual_price"
            type="number"
            step="0.01"
            defaultValue={annualPrice.toFixed(2)}
            onValueChange={(v) => setAnnualPrice(Number(v) || 0)}
          />
          <Field
            label="Credits per year"
            name="annual_credits"
            type="number"
            defaultValue={annualCredits}
            onValueChange={(v) => setAnnualCredits(Number(v) || 0)}
          />
        </div>
      </div>

      <div className="rounded-xl border border-panel-border bg-white/5 p-5">
        <h2 className="text-sm font-semibold text-white">Storage &amp; Project Settings</h2>
        <p className="mt-1 text-xs text-white/40">Control how long unsaved images are kept and how many projects a customer can save.</p>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <Field label="Temporary storage (hours)" name="temp_storage_hours" type="number" defaultValue={settings.temp_storage_hours} />
            <p className="mt-1 text-[11px] text-white/30">Unsaved images auto-delete after this time</p>
          </div>
          <div>
            <Field label="Max saved projects" name="max_saved_projects" type="number" defaultValue={settings.max_saved_projects} />
            <p className="mt-1 text-[11px] text-white/30">Per customer account</p>
          </div>
          <div>
            <Field label="Max upload size (MB)" name="max_upload_mb" type="number" defaultValue={settings.max_upload_mb} />
            <p className="mt-1 text-[11px] text-white/30">Rejected if the uploaded photo is larger than this</p>
          </div>
        </div>
      </div>
    </form>
  );
}

function Toggle({
  name,
  label,
  description,
  defaultChecked,
}: {
  name: string;
  label: string;
  description: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-white">{label}</p>
        <p className="text-xs text-white/40">{description}</p>
      </div>
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="h-5 w-9 accent-brand-gold" />
    </label>
  );
}

function Field({
  label,
  name,
  type,
  step,
  defaultValue,
  onValueChange,
}: {
  label: string;
  name: string;
  type: string;
  step?: string;
  defaultValue: string | number;
  onValueChange?: (value: string) => void;
}) {
  return (
    <label className="mt-4 flex flex-col gap-1.5 text-xs font-semibold uppercase tracking-wide text-white/40">
      {label}
      <input
        name={name}
        type={type}
        step={step}
        min="0"
        defaultValue={defaultValue}
        onChange={onValueChange ? (e) => onValueChange(e.target.value) : undefined}
        className="admin-input normal-case tracking-normal"
      />
    </label>
  );
}
