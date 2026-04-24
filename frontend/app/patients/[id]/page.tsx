import Link from "next/link";
import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";
import { getDashboardContext } from "@/lib/dashboard";

export default async function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, staff } = await getDashboardContext();

  const { data: patient } = await supabase
    .from("patients")
    .select("id, name, phone_number, email, medical_aid_provider, medical_aid_plan, gap_cover, consent_given, consent_timestamp, conversation_state, tags, created_at, updated_at")
    .eq("tenant_id", staff.tenant_id)
    .eq("id", id)
    .single();

  if (!patient) {
    notFound();
  }

  const [{ data: conversations }, { data: appointments }] = await Promise.all([
    supabase
      .from("conversations")
      .select("id, message_direction, message_type, content, intent_detected, created_at")
      .eq("tenant_id", staff.tenant_id)
      .eq("patient_id", id)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("appointments")
      .select("id, service_name, scheduled_at, status, deposit_paid")
      .eq("tenant_id", staff.tenant_id)
      .eq("patient_id", id)
      .order("scheduled_at", { ascending: false })
      .limit(20),
  ]);

  return (
    <DashboardShell
      clinicName={staff.tenants?.name ?? "Dashboard"}
      role={staff.role}
      title={patient.name || patient.phone_number}
      description="Patient profile, recent conversation history, and appointments."
      currentPath="/patients"
    >
      <div className="flex justify-between items-center">
        <Link href="/patients" className="text-primary-600 hover:text-primary-700 font-medium text-sm">
          Back to patients
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div>
            <p className="text-sm text-slate-500">Phone number</p>
            <p className="font-medium text-slate-900">{patient.phone_number}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Email</p>
            <p className="font-medium text-slate-900">{patient.email || "Not provided"}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Medical aid</p>
            <p className="font-medium text-slate-900">{patient.medical_aid_provider || "Not captured"}</p>
            <p className="text-sm text-slate-500">{patient.medical_aid_plan || "No plan captured"}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Consent</p>
            <p className="font-medium text-slate-900">{patient.consent_given ? "Given" : "Pending"}</p>
            <p className="text-sm text-slate-500">{patient.consent_timestamp ? new Date(patient.consent_timestamp).toLocaleString("en-ZA") : "No timestamp"}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Tags</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {patient.tags?.length ? patient.tags.map((tag: string) => (
                <span key={tag} className="px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">{tag}</span>
              )) : <span className="text-sm text-slate-400">No tags</span>}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900">Recent Conversations</h3>
            </div>
            {conversations?.length ? (
              <div className="divide-y divide-slate-100">
                {conversations.map((conversation) => (
                  <div key={conversation.id} className="px-6 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${conversation.message_direction === "inbound" ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"}`}>{conversation.message_direction}</span>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">{conversation.message_type}</span>
                        {conversation.intent_detected ? <span className="px-2 py-1 rounded-full text-xs font-medium bg-violet-100 text-violet-700">{conversation.intent_detected}</span> : null}
                      </div>
                      <p className="text-xs text-slate-400">{new Date(conversation.created_at).toLocaleString("en-ZA")}</p>
                    </div>
                    <p className="text-sm text-slate-700 mt-2 whitespace-pre-wrap">{conversation.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-6 py-10 text-center text-sm text-slate-400">No conversation history yet.</div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900">Appointments</h3>
            </div>
            {appointments?.length ? (
              <div className="divide-y divide-slate-100">
                {appointments.map((appointment) => (
                  <div key={appointment.id} className="px-6 py-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-900">{appointment.service_name || "Consultation"}</p>
                      <p className="text-sm text-slate-500">{appointment.scheduled_at ? new Date(appointment.scheduled_at).toLocaleString("en-ZA") : "No date"}</p>
                    </div>
                    <div className="flex gap-2 items-center">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">{appointment.status}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${appointment.deposit_paid ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{appointment.deposit_paid ? "Paid" : "Unpaid"}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-6 py-10 text-center text-sm text-slate-400">No appointments yet.</div>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
