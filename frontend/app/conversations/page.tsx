import { DashboardShell } from "@/components/dashboard-shell";
import { getDashboardContext } from "@/lib/dashboard";

export default async function ConversationsPage() {
  const { supabase, staff } = await getDashboardContext();

  const { data: conversations } = await supabase
    .from("conversations")
    .select("id, patient_id, message_direction, message_type, content, intent_detected, llm_model_used, created_at")
    .eq("tenant_id", staff.tenant_id)
    .order("created_at", { ascending: false })
    .limit(50);

  const patientIds = Array.from(new Set((conversations ?? []).map((item) => item.patient_id).filter(Boolean)));

  const { data: patients } = patientIds.length
    ? await supabase
        .from("patients")
        .select("id, name, phone_number")
        .in("id", patientIds)
    : { data: [] };

  const patientLookup = new Map((patients ?? []).map((patient) => [patient.id, patient]));

  return (
    <DashboardShell
      clinicName={staff.tenants?.name ?? "Dashboard"}
      role={staff.role}
      title="Conversations"
      description="Review inbound and outbound WhatsApp conversations, intent tags, and AI model usage."
      currentPath="/conversations"
    >
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900">Recent Messages</h3>
        </div>
        {conversations?.length ? (
          <div className="divide-y divide-slate-100">
            {conversations.map((conversation) => {
              const patient = conversation.patient_id ? patientLookup.get(conversation.patient_id) : null;
              return (
                <div key={conversation.id} className="px-6 py-4 space-y-2">
                  <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="font-medium text-slate-900">
                        {patient?.name || patient?.phone_number || "Unknown contact"}
                      </p>
                      <p className="text-sm text-slate-500">
                        {new Date(conversation.created_at).toLocaleString("en-ZA")}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        conversation.message_direction === "inbound"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}>
                        {conversation.message_direction}
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                        {conversation.message_type}
                      </span>
                      {conversation.intent_detected ? (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-violet-100 text-violet-700">
                          {conversation.intent_detected}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{conversation.content || "No content captured"}</p>
                  {conversation.llm_model_used ? (
                    <p className="text-xs text-slate-400">Model: {conversation.llm_model_used}</p>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="px-6 py-12 text-sm text-slate-400 text-center">No conversations logged yet.</div>
        )}
      </div>
    </DashboardShell>
  );
}
