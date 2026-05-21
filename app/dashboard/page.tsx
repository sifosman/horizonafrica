import { DashboardShell } from "@/components/dashboard-shell";
import { getDashboardContext } from "@/lib/dashboard";

export default async function DashboardPage() {
  const { supabase, staff } = await getDashboardContext();

  const { data: patients } = await supabase
    .from("patients")
    .select("*")
    .eq("tenant_id", staff?.tenant_id)
    .order("created_at", { ascending: false })
    .limit(5);

  const { data: appointments } = await supabase
    .from("appointments")
    .select("*")
    .eq("tenant_id", staff?.tenant_id)
    .order("scheduled_at", { ascending: true })
    .limit(5);

  const { data: leads } = await supabase
    .from("leads")
    .select("*")
    .eq("tenant_id", staff?.tenant_id)
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <DashboardShell
      clinicName={staff?.tenants?.name || "Dashboard"}
      role={staff?.role || "staff"}
      title="Dashboard"
      description="High-level snapshot of your patients, appointments, and active leads."
      currentPath="/dashboard"
    >
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <p className="text-sm text-slate-500 font-medium uppercase tracking-wide">Total Patients</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{patients?.length || 0}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <p className="text-sm text-slate-500 font-medium uppercase tracking-wide">Upcoming Appointments</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{appointments?.length || 0}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <p className="text-sm text-slate-500 font-medium uppercase tracking-wide">Active Leads</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{leads?.length || 0}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">Recent Patients</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {patients?.map((p) => (
                <div key={p.id} className="px-6 py-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900">{p.name || p.phone_number}</p>
                    <p className="text-sm text-slate-500">{p.phone_number}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.consent_given ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                    {p.consent_given ? "Consented" : "Pending"}
                  </span>
                </div>
              )) || (
                <div className="px-6 py-8 text-center text-slate-400 text-sm">No patients yet</div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">Upcoming Appointments</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {appointments?.map((a) => (
                <div key={a.id} className="px-6 py-3">
                  <p className="font-medium text-slate-900">{a.service_name || "Consultation"}</p>
                  <p className="text-sm text-slate-500">
                    {a.scheduled_at ? new Date(a.scheduled_at).toLocaleString("en-ZA") : "No date"}
                  </p>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium ${
                    a.status === "confirmed" ? "bg-green-100 text-green-700" :
                    a.status === "proposed" ? "bg-blue-100 text-blue-700" :
                    "bg-slate-100 text-slate-600"
                  }`}>
                    {a.status}
                  </span>
                </div>
              )) || (
                <div className="px-6 py-8 text-center text-slate-400 text-sm">No appointments yet</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
