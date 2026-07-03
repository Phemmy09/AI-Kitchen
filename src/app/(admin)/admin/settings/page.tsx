import { getPlatformSettings } from "@/lib/data/settings";
import { requireAdminProfile } from "@/lib/data/profile";
import { SettingsForm } from "@/components/admin/SettingsForm";

export default async function AdminSettingsPage() {
  const [settings, profile] = await Promise.all([getPlatformSettings(), requireAdminProfile()]);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-white">Subscriptions & Credits</h1>
      <p className="mt-1 text-sm text-white/50">Control how customers access RatedWorktops.</p>

      {profile.role !== "super_admin" ? (
        <p className="mt-6 max-w-md rounded-lg border border-panel-border bg-white/5 p-4 text-sm text-white/50">
          Only Super Admins can change platform pricing and limits. Contact a Super Admin if changes are needed.
        </p>
      ) : (
        <SettingsForm settings={settings} />
      )}
    </div>
  );
}
