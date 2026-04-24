import { DashboardShell } from "@/components/dashboard-shell";
import { getDashboardContext } from "@/lib/dashboard";

export default async function AppointmentsPage() {
  const { supabase, staff } = await getDashboardContext();

  const { data: appointments } = await supabase
    .from("appointments")
    .select("id, patient_id, service_name, scheduled_at, duration_minutes, status, deposit_paid, deposit_amount_cents")
    .eq("tenant_id", staff.tenant_id)
    .order("scheduled_at", { ascending: true });

  const patientIds = Array.from(new Set((appointments ?? []).map((item) => item.patient_id).filter(Boolean)));
  const { data: patients } = patientIds.length
    ? await supabase.from("patients").select("id, name, phone_number").in("id", patientIds)
    : { data: [] };
  const patientLookup = new Map((patients ?? []).map((patient) => [patient.id, patient]));

  return (
    <DashboardShell
      clinicName={staff.tenants?.name ?? "Dashboard"}
      role={staff.role}
      title="Appointments"
      description="Track proposed, confirmed, and completed appointments with deposit status."
      currentPath="/appointments"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500 font-medium uppercase tracking-wide">Total</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{appointments?.length ?? 0}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500 font-medium uppercase tracking-wide">Confirmed</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{appointments?.filter((item) => item.status === "confirmed").length ?? 0}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500 font-medium uppercase tracking-wide">Deposits Paid</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{appointments?.filter((item) => item.deposit_paid).length ?? 0}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900">Schedule</h3>
        </div>
        {appointments?.length ? (
          <div className="divide-y divide-slate-100">
            {appointments.map((appointment) => {
              const patient = appointment.patient_id ? patientLookup.get(appointment.patient_id) : null;
              return (
                <div key={appointment.id} className="px-6 py-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="font-medium text-slate-900">{appointment.service_name || "Consultation"}</p>
                    <p className="text-sm text-slate-500">{patient?.name || patient?.phone_number || "Patient not linked"}</p>
                    <p className="text-sm text-slate-500">{appointment.scheduled_at ? new Date(appointment.scheduled_at).toLocaleString("en-ZA") : "No date set"}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                      {appointment.duration_minutes || 0} min
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      appointment.status === "confirmed"
                        ? "bg-green-100 text-green-700"
                        : appointment.status === "proposed"
                          ? "bg-blue-100 text-blue-700"
                          : appointment.status === "cancelled"
                            ? "bg-red-100 text-red-700"
                            : "bg-slate-100 text-slate-700"
                    }`}>
                      {appointment.status}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${appointment.deposit_paid ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                      {appointment.deposit_paid ? "Deposit paid" : `Deposit ${appointment.deposit_amount_cents ? `R${(appointment.deposit_amount_cents / 100).toFixed(2)}` : "pending"}`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="px-6 py-12 text-sm text-slate-400 text-center">No appointments scheduled yet.</div>
        )}
      </div>
    </DashboardShell>
  );
}
