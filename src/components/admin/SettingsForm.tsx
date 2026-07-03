"use client";

import { useActionState } from "react";
import { updatePlatformSettings } from "@/lib/actions/admin/settings";
import type { AdminActionResult } from "@/lib/actions/admin/users";
import type { PlatformSettings } from "@/lib/data/settings";
import { FormError, FormNotice } from "@/components/auth/AuthCard";
import { Button } from "@/components/ui/Button";

const initialState: AdminActionResult | null = null;

export function SettingsForm({ settings }: { settings: PlatformSettings }) {
  const [state, formAction, isPending] = useActionState(
    async (_prev: AdminActionResult | null, formData: FormData) => updatePlatformSettings(formData),
    initialState,
  );

  return (
    <form action={formAction} className="mt-6 flex max-w-3xl flex-col gap-6">
      {state && "error" in state && <FormError message={state.error} />}
      {state && "success" in state && <FormNotice message="Settings saved." />}

      <div className="rounded-xl border border-panel-border bg-white/5 p-5">
        <h2 className="text-sm font-semibold text-white">Platform Mode</h2>
        <div className="mt-4 flex flex-col gap-4">
          <Toggle name="free_credits_enabled" label="Free Credits" defaultChecked={settings.free_credits_enabled} description="New customers receive free credits on registration." />
          <Toggle name="subscriptions_enabled" label="Subscription Plans" defaultChecked={settings.subscriptions_enabled} description="When disabled, every generation is free and unlimited." />
        </div>
      </div>

      <div className="rounded-xl border border-panel-border bg-white/5 p-5">
        <h2 className="text-sm font-semibold text-white">Free Credit Allowance</h2>
        <Field label="Credits per new user" name="free_credit_amount" type="number" defaultValue={settings.free_credit_amount} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-panel-border bg-white/5 p-5">
          <h2 className="text-sm font-semibold text-white">Monthly Plan</h2>
          <Field label="Price (USD)" name="monthly_price" type="number" step="0.01" defaultValue={(settings.monthly_price_cents / 100).toFixed(2)} />
          <Field label="Credits per month" name="monthly_credits" type="number" defaultValue={settings.monthly_credits} />
        </div>
        <div className="rounded-xl border border-panel-border bg-white/5 p-5">
          <h2 className="text-sm font-semibold text-white">Annual Plan</h2>
          <Field label="Price (USD)" name="annual_price" type="number" step="0.01" defaultValue={(settings.annual_price_cents / 100).toFixed(2)} />
          <Field label="Credits per year" name="annual_credits" type="number" defaultValue={settings.annual_credits} />
        </div>
      </div>

      <div className="rounded-xl border border-panel-border bg-white/5 p-5">
        <h2 className="text-sm font-semibold text-white">Storage & Project Settings</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Temporary storage (hours)" name="temp_storage_hours" type="number" defaultValue={settings.temp_storage_hours} />
          <Field label="Max saved projects" name="max_saved_projects" type="number" defaultValue={settings.max_saved_projects} />
          <Field label="Max upload size (MB)" name="max_upload_mb" type="number" defaultValue={settings.max_upload_mb} />
        </div>
      </div>

      <Button type="submit" disabled={isPending} className="self-start">
        {isPending ? "Saving..." : "Save All Changes"}
      </Button>
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
}: {
  label: string;
  name: string;
  type: string;
  step?: string;
  defaultValue: string | number;
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
        className="admin-input normal-case tracking-normal"
      />
    </label>
  );
}
