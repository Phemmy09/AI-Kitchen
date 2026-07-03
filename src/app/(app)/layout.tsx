import { requireProfile } from "@/lib/data/profile";
import { AppNavbar } from "@/components/app/AppNavbar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireProfile();

  return (
    <div className="flex min-h-screen flex-col bg-[#0a0a0d]">
      <AppNavbar profile={profile} />
      <main className="flex-1">{children}</main>
    </div>
  );
}
