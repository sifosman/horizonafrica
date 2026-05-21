import Link from "next/link";
import { DashboardShell } from "@/components/dashboard-shell";
import { getDashboardContext } from "@/lib/dashboard";

export default async function PatientsPage() {
  const { supabase, staff } = await getDashboardContext();

  if (!staff?.tenant_id) {
    return (
      <DashboardShell clinicName="Dashboard" role="staff" title="Patients" description="Access Denied" currentPath="/patients">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 text-center py-12 text-slate-500">
          Staff account details not found. Please contact support.
        </div>
      </DashboardShell>
    );
  }

  const { data: patients } = await supabase
    .from("patients")
    .select("id, name, phone_number, email, medical_aid_provider, medical_aid_plan, consent_given, updated_at")
    .eq("tenant_id", staff.tenant_id)
    .order("updated_at", { ascending: false });

  return (
    <DashboardShell
      clinicName={staff.tenants?.name ?? "Dashboard"}
      role={staff.role}
      title="Patients"
      description="View patient records, consent status, and medical aid details."
      currentPath="/patients"
    >
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">Patient Directory</h3>
          <span className="text-sm text-slate-500">{patients?.length ?? 0} records</span>
        </div>
        {patients?.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wide text-xs">
                <tr>
                  <th className="px-6 py-3 text-left">Patient</th>
                  <th className="px-6 py-3 text-left">Contact</th>
                  <th className="px-6 py-3 text-left">Medical Aid</th>
                  <th className="px-6 py-3 text-left">Consent</th>
                  <th className="px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {patients.map((patient) => (
                  <tr key={patient.id}>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900">{patient.name || "Unnamed patient"}</p>
                      <p className="text-slate-500">Updated {patient.updated_at ? new Date(patient.updated_at).toLocaleDateString("en-ZA") : "-"}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      <p>{patient.phone_number}</p>
                      <p className="text-slate-500">{patient.email || "No email"}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      <p>{patient.medical_aid_provider || "Not captured"}</p>
                      <p className="text-slate-500">{patient.medical_aid_plan || "No plan"}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${patient.consent_given ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                        {patient.consent_given ? "Consented" : "Pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/patients/${patient.id}`} className="text-primary-600 hover:text-primary-700 font-medium">
                        View profile
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-12 text-sm text-slate-400 text-center">No patients available yet.</div>
        )}
      </div>
    </DashboardShell>
  );
}
