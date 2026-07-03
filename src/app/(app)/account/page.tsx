import { requireProfile } from "@/lib/data/profile";
import { AccountPanel } from "@/components/account/AccountPanel";

export default async function AccountPage() {
  const profile = await requireProfile();
  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <h1 className="font-display text-2xl font-bold text-white">My Profile</h1>
      <AccountPanel profile={profile} />
    </div>
  );
}
