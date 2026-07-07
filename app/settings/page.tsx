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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-surface-container-lowest rounded-3xl shadow-sm border border-surface-container p-8 space-y-6">
          <h3 className="text-xl font-bold text-primary mb-2">Clinic Profile</h3>
          <div className="space-y-4">
            <div className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant/20">
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Clinic slug</p>
              <p className="font-bold text-on-surface">{tenant?.slug || "Not set"}</p>
            </div>
            <div className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant/20">
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">WhatsApp number</p>
              <p className="font-bold text-on-surface">{tenant?.whatsapp_number || "Not connected yet"}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant/20">
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Auto booking</p>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${tenant?.auto_booking_enabled ? "bg-primary/10 text-primary" : "bg-outline-variant text-outline"}`}>
                  {tenant?.auto_booking_enabled ? "Active" : "Disabled"}
                </span>
              </div>
              <div className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant/20">
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Deposit policy</p>
                <p className="text-sm font-bold text-on-surface">
                  {tenant?.deposit_required
                    ? `R${(tenant.deposit_amount ? tenant.deposit_amount / 100 : 0).toFixed(2)}`
                    : "No deposit"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-surface-container-lowest rounded-3xl shadow-sm border border-surface-container p-8">
            <h3 className="text-xl font-bold text-primary mb-4">Business Hours</h3>
            <div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/20">
              <pre className="text-[11px] font-mono text-on-surface-variant overflow-x-auto leading-relaxed">{formatJson(tenant?.business_hours)}</pre>
            </div>
          </div>
          <div className="bg-surface-container-lowest rounded-3xl shadow-sm border border-surface-container p-8">
            <h3 className="text-xl font-bold text-primary mb-4">Reminder Schedule</h3>
            <div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/20">
              <pre className="text-[11px] font-mono text-on-surface-variant overflow-x-auto leading-relaxed">{formatJson(tenant?.reminder_schedule)}</pre>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
