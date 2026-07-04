"use client";

import { useState, useTransition } from "react";
import { Search, Ban, CheckCircle2, RotateCcw, Trash2, Eye } from "lucide-react";
import type { AdminUserRow } from "@/lib/data/admin";
import { suspendUser, unsuspendUser, resetUserCredits, updateUserRole, deleteUserPermanently } from "@/lib/actions/admin/users";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { UserDetailModal } from "@/components/admin/UserDetailModal";

export function UsersTable({
  users,
  isSuperAdmin,
  currentAdminId,
}: {
  users: AdminUserRow[];
  isSuperAdmin: boolean;
  currentAdminId: string;
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "suspended">("all");
  const [planFilter, setPlanFilter] = useState<"all" | "free" | "monthly" | "annual">("all");
  const [isPending, startTransition] = useTransition();
  const [pendingDelete, setPendingDelete] = useState<AdminUserRow | null>(null);
  const [viewing, setViewing] = useState<AdminUserRow | null>(null);

  const filtered = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || u.status === statusFilter;
    const matchesPlan = planFilter === "all" || u.plan === planFilter;
    return matchesSearch && matchesStatus && matchesPlan;
  });

  function handleResetCredits(userId: string) {
    const amount = window.prompt("Set credits to:");
    if (amount === null) return;
    const n = Number(amount);
    if (Number.isNaN(n) || n < 0) return;
    startTransition(() => void resetUserCredits(userId, n));
  }

  return (
    <div className="mt-6">
      <div className="flex flex-wrap gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full rounded-lg border border-panel-border bg-white/5 py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-white/30 outline-none transition-colors focus:border-brand-gold"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          className="rounded-lg border border-panel-border bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-brand-gold"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
        <select
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value as typeof planFilter)}
          className="rounded-lg border border-panel-border bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-brand-gold"
        >
          <option value="all">All Plans</option>
          <option value="free">Free</option>
          <option value="monthly">Monthly</option>
          <option value="annual">Annual</option>
        </select>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-panel-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 text-xs uppercase tracking-wide text-white/40">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Plan</th>
              <th className="px-4 py-3">Credits</th>
              <th className="px-4 py-3">Visualisations</th>
              <th className="px-4 py-3">Downloads</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3">Last Active</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-panel-border">
            {filtered.map((u) => (
              <tr key={u.id} className="transition-colors hover:bg-white/[0.02]">
                <td className="px-4 py-3">
                  <p className="font-medium text-white">{u.name}</p>
                  <p className="text-xs text-white/40">{u.email}</p>
                </td>
                <td className="px-4 py-3">
                  {isSuperAdmin && u.id !== currentAdminId ? (
                    <select
                      defaultValue={u.role}
                      disabled={isPending}
                      onChange={(e) =>
                        startTransition(() =>
                          void updateUserRole(u.id, e.target.value as "customer" | "admin" | "super_admin"),
                        )
                      }
                      className="rounded-md border border-panel-border bg-white/5 px-2 py-1 text-xs text-white"
                    >
                      <option value="customer">Customer</option>
                      <option value="admin">Admin</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                  ) : (
                    <span className="text-xs capitalize text-white/60">{u.role.replace("_", " ")}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-xs capitalize text-white/60">{u.plan}</td>
                <td className="px-4 py-3 text-white/80">{u.credits}</td>
                <td className="px-4 py-3 text-white/60">{u.visualisations_count}</td>
                <td className="px-4 py-3 text-white/60">{u.downloads_count}</td>
                <td className="px-4 py-3 text-white/60">{new Date(u.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-white/60">{new Date(u.last_active).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      u.status === "active" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                    }`}
                  >
                    {u.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button
                      title="View details"
                      onClick={() => setViewing(u)}
                      className="rounded-md p-1.5 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      title="Reset credits"
                      disabled={isPending}
                      onClick={() => handleResetCredits(u.id)}
                      className="rounded-md p-1.5 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </button>
                    {u.status === "active" ? (
                      <button
                        title="Suspend"
                        disabled={isPending}
                        onClick={() => startTransition(() => void suspendUser(u.id))}
                        className="rounded-md p-1.5 text-white/40 transition-colors hover:bg-red-500/10 hover:text-red-400"
                      >
                        <Ban className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        title="Reactivate"
                        disabled={isPending}
                        onClick={() => startTransition(() => void unsuspendUser(u.id))}
                        className="rounded-md p-1.5 text-white/40 transition-colors hover:bg-emerald-500/10 hover:text-emerald-400"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </button>
                    )}
                    {isSuperAdmin && u.id !== currentAdminId && (
                      <button
                        title="Delete permanently"
                        disabled={isPending}
                        onClick={() => setPendingDelete(u)}
                        className="rounded-md p-1.5 text-white/40 transition-colors hover:bg-red-500/10 hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="p-8 text-center text-sm text-white/30">No users match your search.</p>}
      </div>

      <ConfirmModal
        open={pendingDelete !== null}
        title="Delete this user?"
        description={`Permanently delete ${pendingDelete?.email}? This cannot be undone.`}
        confirmLabel="Delete"
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) startTransition(() => void deleteUserPermanently(pendingDelete.id));
          setPendingDelete(null);
        }}
      />

      <UserDetailModal user={viewing} onClose={() => setViewing(null)} />
    </div>
  );
}
