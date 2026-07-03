import { getAuditLog } from "@/lib/data/admin";

const ACTION_LABELS: Record<string, string> = {
  suspend_user: "Suspended user",
  unsuspend_user: "Reactivated user",
  reset_credits: "Reset credits",
  update_role: "Changed role",
  delete_user: "Deleted user",
  create_brand: "Created brand",
  enable_brand: "Enabled brand",
  disable_brand: "Disabled brand",
  delete_brand: "Deleted brand",
  create_colour: "Created colour",
  enable_colour: "Enabled colour",
  disable_colour: "Disabled colour",
  delete_colour: "Deleted colour",
  bulk_create_colours: "Bulk imported colours",
  create_category: "Created category",
  enable_category: "Enabled category",
  disable_category: "Disabled category",
  delete_category: "Deleted category",
  reorder_category: "Reordered category",
  update_platform_settings: "Updated platform settings",
};

export default async function AdminAuditLogPage() {
  const entries = await getAuditLog();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-white">Audit Log</h1>
      <p className="mt-1 text-sm text-white/50">Every admin action, most recent first.</p>

      <div className="mt-6 flex flex-col divide-y divide-panel-border rounded-xl border border-panel-border bg-white/5">
        {entries.length === 0 && <p className="p-8 text-center text-sm text-white/30">No admin actions yet.</p>}
        {entries.map((entry) => {
          const admin = entry.profiles as unknown as { name: string; email: string } | null;
          return (
            <div key={entry.id} className="flex items-center justify-between p-4 text-sm">
              <div>
                <p className="text-white">
                  <span className="font-medium">{admin?.name ?? "Unknown admin"}</span>{" "}
                  {ACTION_LABELS[entry.action] ?? entry.action}
                  {entry.target_type && <span className="text-white/40"> · {entry.target_type}</span>}
                </p>
                <p className="text-xs text-white/30">{admin?.email}</p>
              </div>
              <p className="text-xs text-white/40">{new Date(entry.created_at).toLocaleString()}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
