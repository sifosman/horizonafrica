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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-sm border border-surface-container hover:shadow-md transition-shadow">
          <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-3">Total Volume</p>
          <div className="flex items-baseline gap-2">
            <h4 className="text-4xl font-medium text-on-surface">{enrichedAppointments.length}</h4>
            <span className="text-outline text-xs uppercase font-bold tracking-tighter">Bookings</span>
          </div>
        </div>
        <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-sm border border-surface-container hover:shadow-md transition-shadow">
          <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-3">Confirmed</p>
          <div className="flex items-baseline gap-2">
            <h4 className="text-4xl font-medium text-primary">{confirmed}</h4>
            <span className="text-primary/60 text-xs uppercase font-bold tracking-tighter">Ready</span>
          </div>
        </div>
        <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-sm border border-surface-container hover:shadow-md transition-shadow">
          <p className="text-[10px] font-bold text-on-primary-container uppercase tracking-widest mb-3">Deposits Paid</p>
          <div className="flex items-baseline gap-2">
            <h4 className="text-4xl font-medium text-primary-container">{deposited}</h4>
            <span className="text-primary-container/60 text-xs uppercase font-bold tracking-tighter">Secured</span>
          </div>
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
