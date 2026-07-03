import { requireAdminProfile } from "@/lib/data/profile";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireAdminProfile();

  return (
    <div className="flex min-h-screen bg-[#0a0a0d]">
      <AdminSidebar profile={profile} />
      <main className="flex-1 px-8 py-6">{children}</main>
    </div>
  );
}
