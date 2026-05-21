import { DashboardShell } from "@/components/dashboard-shell";
import { getDashboardContext } from "@/lib/dashboard";

function formatJson(value: Record<string, unknown> | null | undefined) {
  if (!value) {
    return "Not configured";
  }

  return JSON.stringify(value, null, 2);
}

export default async function SettingsPage() {
  const { staff } = await getDashboardContext();

  if (!staff) {
    return (
      <DashboardShell clinicName="Dashboard" role="staff" title="Settings" description="Access Denied" currentPath="/settings">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 text-center py-12 text-slate-500">
          Staff account details not found. Please contact support.
        </div>
      </DashboardShell>
    );
  }

  const tenant = staff.tenants;

  return (
    <DashboardShell
      clinicName={tenant?.name ?? "Dashboard"}
      role={staff.role}
      title="Settings"
      description="Review clinic operating settings that will drive scheduling, reminders, and automation."
      currentPath="/settings"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div>
            <p className="text-sm text-slate-500">Clinic slug</p>
            <p className="font-medium text-slate-900">{tenant?.slug || "Not set"}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">WhatsApp number</p>
            <p className="font-medium text-slate-900">{tenant?.whatsapp_number || "Not connected yet"}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Auto booking</p>
            <p className="font-medium text-slate-900">{tenant?.auto_booking_enabled ? "Enabled" : "Disabled"}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Deposit policy</p>
            <p className="font-medium text-slate-900">
              {tenant?.deposit_required
                ? `Required${tenant.deposit_amount ? ` · R${(tenant.deposit_amount / 100).toFixed(2)}` : ""}`
                : "No deposit required"}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div>
            <p className="text-sm text-slate-500 mb-2">Business hours</p>
            <pre className="bg-slate-50 rounded-lg p-4 text-xs text-slate-700 overflow-x-auto">{formatJson(tenant?.business_hours)}</pre>
          </div>
          <div>
            <p className="text-sm text-slate-500 mb-2">Reminder schedule</p>
            <pre className="bg-slate-50 rounded-lg p-4 text-xs text-slate-700 overflow-x-auto">{formatJson(tenant?.reminder_schedule)}</pre>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
