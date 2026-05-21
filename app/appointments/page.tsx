import { DashboardShell } from "@/components/dashboard-shell";
import { AppointmentCalendar } from "@/components/appointment-calendar";
import { getDashboardContext } from "@/lib/dashboard";

export default async function AppointmentsPage() {
  const { supabase, user, staff } = await getDashboardContext();

  if (!staff?.tenant_id) {
    return (
      <DashboardShell clinicName="Dashboard" role="staff" title="Appointments" description="Access Denied" currentPath="/appointments">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 text-center py-12 text-slate-500">
          Staff account details not found. Please contact support.
        </div>
      </DashboardShell>
    );
  }

  const { data: appointments } = await supabase
    .from("appointments")
    .select("id, patient_id, service_name, scheduled_at, duration_minutes, status, deposit_paid, deposit_amount_cents")
    .eq("tenant_id", staff.tenant_id)
    .order("scheduled_at", { ascending: true });

  type PatientRow = { id: string; name: string | null; phone_number: string | null };
  type AppointmentRow = { id: string; patient_id: string | null; service_name: string | null; scheduled_at: string; duration_minutes: number | null; status: string; deposit_paid: boolean; deposit_amount_cents: number | null };

  const patientIds = Array.from(new Set((appointments ?? []).map((item: AppointmentRow) => item.patient_id).filter(Boolean)));
  const { data: patients } = patientIds.length
    ? await supabase.from("patients").select("id, name, phone_number").in("id", patientIds)
    : { data: [] as PatientRow[] };
  const patientLookup = new Map((patients ?? []).map((p: PatientRow) => [p.id, p]));

  const { data: timeBlocks } = await supabase
    .from("time_blocks")
    .select("id, title, start_at, end_at, all_day, notes")
    .eq("tenant_id", staff.tenant_id)
    .order("start_at", { ascending: true });

  const enrichedAppointments = (appointments ?? []).map((a: AppointmentRow) => {
    const patient = a.patient_id ? patientLookup.get(a.patient_id) : null;
    return { ...a, patient_name: patient?.name ?? null, patient_phone: patient?.phone_number ?? null };
  });

  const confirmed = enrichedAppointments.filter((a: AppointmentRow) => a.status === "confirmed").length;
  const deposited = enrichedAppointments.filter((a: AppointmentRow) => a.deposit_paid).length;

  return (
    <DashboardShell
      clinicName={staff.tenants?.name ?? "Dashboard"}
      role={staff.role}
      title="Appointments"
      description="View, manage, and block time slots on your clinic calendar."
      currentPath="/appointments"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Total</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{enrichedAppointments.length}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Confirmed</p>
          <p className="text-3xl font-bold text-emerald-600 mt-1">{confirmed}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Deposits Paid</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">{deposited}</p>
        </div>
      </div>

      <AppointmentCalendar
        appointments={enrichedAppointments}
        timeBlocks={timeBlocks ?? []}
        tenantId={staff.tenant_id}
        userId={user.id}
      />
    </DashboardShell>
  );
}
