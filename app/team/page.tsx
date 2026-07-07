import { getDashboardContext } from "@/lib/dashboard";
import { DashboardShell } from "@/components/dashboard-shell";
import { TeamClient } from "@/components/team-manager";

export default async function TeamPage() {
  const { staff } = await getDashboardContext();

  if (!staff) {
    return (
      <DashboardShell clinicName="Dashboard" role="staff" title="Team" description="Access Denied" currentPath="/team">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 text-center py-12 text-slate-500">
          Staff account details not found. Please contact support.
        </div>
      </DashboardShell>
    );
  }

  if (staff.role !== "admin") {
    return (
      <DashboardShell
        clinicName={staff.tenants?.name ?? "Dashboard"}
        role={staff.role}
        title="Team"
        description="Only admins can manage team members."
        currentPath="/team"
      >
        <div className="bg-surface-container-lowest rounded-3xl p-12 text-center border border-surface-container">
          <span className="material-symbols-outlined text-6xl text-outline mb-4 block">lock</span>
          <p className="text-on-surface-variant text-lg">
            You need admin access to manage team members.
          </p>
          <p className="text-outline text-sm mt-2">
            Contact your clinic administrator if you need access.
          </p>
        </div>
      </DashboardShell>
    );
  }

  return (
    <TeamClient
      clinicName={staff.tenants?.name ?? "Dashboard"}
      role={staff.role}
      tenantId={staff.tenant_id}
    />
  );
}
