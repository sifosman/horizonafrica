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
      <div className="bg-surface-container-lowest rounded-3xl shadow-sm border border-surface-container overflow-hidden">
        <div className="px-8 py-6 border-b border-surface-container bg-surface-container-low/30 flex items-center justify-between">
          <h3 className="text-xl font-bold text-primary">Patient Directory</h3>
          <span className="bg-secondary-container text-primary px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
            {patients?.length ?? 0} Records
          </span>
        </div>
        
        {patients?.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-surface-container-low/20">
                  <th className="px-8 py-4 text-left text-[10px] font-bold text-outline uppercase tracking-widest">Patient</th>
                  <th className="px-8 py-4 text-left text-[10px] font-bold text-outline uppercase tracking-widest">Contact</th>
                  <th className="px-8 py-4 text-left text-[10px] font-bold text-outline uppercase tracking-widest">Medical Aid</th>
                  <th className="px-8 py-4 text-left text-[10px] font-bold text-outline uppercase tracking-widest">Status</th>
                  <th className="px-8 py-4 text-right text-[10px] font-bold text-outline uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container">
                {patients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-surface-container-low/10 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center text-primary font-bold shadow-sm">
                          {(patient.name || "U").charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-on-surface leading-none">{patient.name || "Unnamed patient"}</p>
                          <p className="text-xs text-outline mt-1 font-medium italic">
                            Updated {patient.updated_at ? new Date(patient.updated_at).toLocaleDateString("en-ZA") : "-"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-sm font-bold text-on-surface">{patient.phone_number}</p>
                      <p className="text-xs text-outline font-medium">{patient.email || "No email"}</p>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-sm font-bold text-on-surface">{patient.medical_aid_provider || <span className="text-outline/40 font-normal italic">Not captured</span>}</p>
                      <p className="text-xs text-outline font-medium">{patient.medical_aid_plan || "No plan"}</p>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                        patient.consent_given 
                          ? "bg-primary/10 text-primary border-primary/20 shadow-sm" 
                          : "bg-error-container text-on-error-container border-error/10"
                      }`}>
                        {patient.consent_given ? "Consented" : "Pending"}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <Link 
                        href={`/patients/${patient.id}`} 
                        className="inline-flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-widest hover:underline transition-all group-hover:translate-x-[-4px] duration-300"
                      >
                        View Profile
                        <span className="material-symbols-outlined text-xs">arrow_forward</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-8 py-20 text-center flex flex-col items-center gap-4">
            <span className="material-symbols-outlined text-4xl text-outline opacity-20">group</span>
            <p className="text-outline italic font-medium">No patients available yet.</p>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
