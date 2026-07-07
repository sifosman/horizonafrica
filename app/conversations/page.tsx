import { DashboardShell } from "@/components/dashboard-shell";
import { getDashboardContext } from "@/lib/dashboard";

export default async function ConversationsPage() {
  const { supabase, staff } = await getDashboardContext();

  if (!staff?.tenant_id) {
    return (
      <DashboardShell clinicName="Dashboard" role="staff" title="Conversations" description="Access Denied" currentPath="/conversations">
        <div className="bg-surface-container-lowest rounded-3xl p-12 shadow-sm border border-surface-container text-center text-outline">
          Staff account details not found. Please contact support.
        </div>
      </DashboardShell>
    );
  }

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
      description="Review inbound and outbound WhatsApp conversations handled by your AI assistant."
      currentPath="/conversations"
    >
      <div className="bg-surface-container-lowest rounded-3xl shadow-sm border border-surface-container overflow-hidden">
        <div className="px-8 py-6 border-b border-surface-container bg-surface-container-low/30">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-primary">Recent Activity</h3>
            <div className="flex gap-2">
              <span className="bg-primary text-on-primary px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase">Live Feed</span>
            </div>
          </div>
        </div>
        
        {conversations?.length ? (
          <div className="divide-y divide-surface-container">
            {conversations.map((conversation) => {
              const patient = conversation.patient_id ? patientLookup.get(conversation.patient_id) : null;
              const isInbound = conversation.message_direction === "inbound";
              
              return (
                <div key={conversation.id} className="px-8 py-6 hover:bg-surface-container-low/20 transition-all group">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                        isInbound ? "bg-secondary-container text-primary" : "bg-primary text-on-primary"
                      }`}>
                        <span className="material-symbols-outlined">
                          {isInbound ? "arrow_downward" : "arrow_upward"}
                        </span>
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-bold text-on-surface truncate">
                          {patient?.name || patient?.phone_number || "Guest contact"}
                        </p>
                        <p className="text-xs text-on-surface-variant font-medium mt-0.5">
                          {new Date(conversation.created_at).toLocaleString("en-ZA", { 
                            hour: '2-digit', 
                            minute: '2-digit',
                            day: 'numeric',
                            month: 'short'
                          })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {conversation.intent_detected && (
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-primary-container/20 text-primary border border-primary/10">
                          {conversation.intent_detected}
                        </span>
                      )}
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase ${
                        isInbound ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"
                      }`}>
                        {conversation.message_direction}
                      </span>
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-surface-container-high text-on-surface-variant">
                        {conversation.message_type}
                      </span>
                    </div>
                  </div>

                  <div className={`mt-4 p-4 rounded-2xl text-sm leading-relaxed border ${
                    isInbound 
                      ? "bg-white border-outline-variant/30 text-on-surface" 
                      : "bg-primary-container/10 border-primary/10 text-on-primary-container"
                  }`}>
                    {conversation.content || <span className="italic opacity-50">No content available</span>}
                  </div>

                  {conversation.llm_model_used && (
                    <div className="mt-3 flex items-center gap-1.5 ml-1">
                      <span className="material-symbols-outlined text-[14px] text-primary">auto_awesome</span>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-primary/60">
                        AI Response via {conversation.llm_model_used}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="px-6 py-20 text-center flex flex-col items-center gap-4">
            <span className="material-symbols-outlined text-4xl text-outline opacity-20">chat_bubble</span>
            <p className="text-outline italic font-medium">No conversations logged yet.</p>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
