import { DashboardShell } from "@/components/dashboard-shell";
import { getDashboardContext } from "@/lib/dashboard";
import Link from "next/link";

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
      description="Your clinic is thriving today. Here is what's happening."
      currentPath="/dashboard"
    >
      <div className="space-y-12">
        {/* KPI Cards Bento Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-sm border border-surface-container hover:shadow-md transition-shadow">
            <p className="text-xs font-bold text-outline uppercase tracking-wider mb-4">Total Patients</p>
            <div className="flex items-baseline gap-2">
              <h4 className="text-4xl font-medium text-primary">{patients?.length || 0}</h4>
              <span className="text-primary-container text-sm">+2 this week</span>
            </div>
          </div>
          <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-sm border border-surface-container hover:shadow-md transition-shadow">
            <p className="text-xs font-bold text-outline uppercase tracking-wider mb-4">Upcoming Appointments</p>
            <div className="flex items-baseline gap-2">
              <h4 className="text-4xl font-medium text-primary">{appointments?.length || 0}</h4>
              <span className="text-primary-container text-sm">Today</span>
            </div>
          </div>
          <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-sm border border-surface-container hover:shadow-md transition-shadow">
            <p className="text-xs font-bold text-outline uppercase tracking-wider mb-4">Active Leads</p>
            <div className="flex items-baseline gap-2">
              <h4 className="text-4xl font-medium text-on-surface">{leads?.length || 0}</h4>
              <span className="text-on-surface-variant text-sm">New today</span>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-gutter">
          {/* Appointments List */}
          <section className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h5 className="text-2xl font-medium text-primary">Today's Appointments</h5>
              <p className="text-sm text-outline">{new Date().toLocaleDateString("en-ZA", { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            </div>
            <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-sm border border-surface-container">
              <div className="space-y-4">
                {appointments?.map((a) => (
                  <div key={a.id} className="group flex items-start gap-6 p-4 rounded-2xl hover:bg-secondary-container/20 transition-all border-l-4 border-primary">
                    <div className="w-16 pt-1">
                      <p className="text-lg font-medium text-primary">
                        {a.scheduled_at ? new Date(a.scheduled_at).toLocaleTimeString("en-ZA", { hour: '2-digit', minute: '2-digit' }) : "00:00"}
                      </p>
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-on-surface">{a.patient_name || "Patient"}</p>
                      <p className="text-sm text-on-surface-variant">{a.service_name || "Consultation"}</p>
                    </div>
                    <div className="pt-1">
                      <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                        a.status === "confirmed" ? "bg-secondary-container text-primary" : "bg-surface-container-high text-outline"
                      }`}>
                        {a.status}
                      </span>
                    </div>
                  </div>
                )) || (
                  <div className="py-8 text-center text-outline italic">No appointments yet</div>
                )}
              </div>
              <div className="mt-8 text-center">
                <Link href="/appointments" className="text-primary text-xs font-bold uppercase tracking-widest hover:underline transition-all">
                  View Full Calendar
                </Link>
              </div>
            </div>
          </section>

          {/* Recent Patients */}
          <section className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h5 className="text-2xl font-medium text-primary">Recent Patients</h5>
            </div>
            <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-sm border border-surface-container">
              <div className="space-y-4">
                {patients?.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-surface-container-low transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center text-primary font-bold">
                        {(p.name || p.phone_number).charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-on-surface">{p.name || p.phone_number}</p>
                        <p className="text-sm text-on-surface-variant">{p.phone_number}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      p.consent_given ? "bg-primary/10 text-primary" : "bg-error-container text-on-error-container"
                    }`}>
                      {p.consent_given ? "CONSENTED" : "PENDING"}
                    </span>
                  </div>
                )) || (
                  <div className="py-8 text-center text-outline italic">No patients yet</div>
                )}
              </div>
              <div className="mt-8 text-center">
                <Link href="/patients" className="text-primary text-xs font-bold uppercase tracking-widest hover:underline transition-all">
                  View All Patients
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </DashboardShell>
  );
}
