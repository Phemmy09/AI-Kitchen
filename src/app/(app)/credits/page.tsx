import { requireProfile } from "@/lib/data/profile";
import { getPlatformSettings } from "@/lib/data/settings";
import { SubscriptionPanel } from "@/components/credits/SubscriptionPanel";

export default async function CreditsPage() {
  const [profile, settings] = await Promise.all([requireProfile(), getPlatformSettings()]);

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <h1 className="font-display text-2xl font-bold text-white">Subscription & Billing</h1>
      <p className="mt-1 text-sm text-white/50">Manage your plan and visualisation credits.</p>

      <SubscriptionPanel profile={profile} settings={settings} />
    </div>
  );
}
