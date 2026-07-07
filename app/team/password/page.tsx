import { getDashboardContext } from "@/lib/dashboard";
import { DashboardShell } from "@/components/dashboard-shell";
import { ChangePasswordClient } from "@/components/change-password";

export default async function ChangePasswordPage() {
  const { staff } = await getDashboardContext();

  if (!staff) {
    return (
      <DashboardShell clinicName="Dashboard" role="staff" title="Change Password" description="Access Denied" currentPath="/team">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 text-center py-12 text-slate-500">
          Staff account details not found. Please contact support.
        </div>
      </DashboardShell>
    );
  }

  return (
    <ChangePasswordClient
      clinicName={staff.tenants?.name ?? "Dashboard"}
      role={staff.role}
    />
  );
}
