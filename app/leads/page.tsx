import { DashboardShell } from "@/components/dashboard-shell";
import { getDashboardContext } from "@/lib/dashboard";

const leadColumns = ["new", "qualified", "contacted", "booked", "converted", "lost"];

export default async function LeadsPage() {
  const { supabase, staff } = await getDashboardContext();

  if (!staff?.tenant_id) {
    return (
      <DashboardShell clinicName="Dashboard" role="staff" title="Leads" description="Access Denied" currentPath="/leads">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 text-center py-12 text-slate-500">
          Staff account details not found. Please contact support.
        </div>
      </DashboardShell>
    );
  }

  const { data: leads } = await supabase
    .from("leads")
    .select("id, phone_number, lead_score, status, interest_service, budget_indication, assigned_to_user_id, created_at, last_contact_at")
    .eq("tenant_id", staff.tenant_id)
    .order("created_at", { ascending: false });

  return (
    <DashboardShell
      clinicName={staff.tenants?.name ?? "Dashboard"}
      role={staff.role}
      title="Leads"
      description="Track inbound inquiries from first contact through qualification and conversion."
      currentPath="/leads"
    >
      <div className="grid grid-cols-1 xl:grid-cols-6 gap-4 overflow-x-auto pb-8 custom-scrollbar">
        {leadColumns.map((column) => {
          const items = (leads ?? []).filter((lead) => lead.status === column);
          return (
            <div key={column} className="bg-surface-container-low/30 rounded-3xl border border-surface-container/50 min-h-[500px] flex flex-col w-full min-w-[200px]">
              <div className="px-6 py-5 flex items-center justify-between">
                <h3 className="text-xs font-bold text-primary uppercase tracking-widest leading-none">{column}</h3>
                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm">{items.length}</span>
              </div>
              <div className="p-3 space-y-4 flex-1">
                {items.length ? (
                  items.map((lead) => (
                    <div key={lead.id} className="rounded-2xl border border-surface-container bg-surface-container-lowest p-4 space-y-3 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer group">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-bold text-on-surface text-sm">{lead.phone_number}</p>
                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider border shadow-sm ${
                          lead.lead_score === "hot"
                            ? "bg-error/10 text-error border-error/10"
                            : lead.lead_score === "warm"
                              ? "bg-primary-container/20 text-primary border-primary/10"
                              : "bg-surface-container-high text-outline border-outline-variant/30"
                        }`}>
                          {lead.lead_score || "unscored"}
                        </span>
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-on-surface leading-tight line-clamp-1">{lead.interest_service || "General Inquiry"}</p>
                        <p className="text-[10px] text-outline mt-1 font-medium italic">Budget: {lead.budget_indication || "N/A"}</p>
                      </div>
                      <div className="pt-2 border-t border-surface-container/50 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-xs text-outline">history</span>
                        <p className="text-[9px] text-outline font-bold uppercase tracking-tighter">
                          {lead.last_contact_at ? new Date(lead.last_contact_at).toLocaleDateString("en-ZA") : "No contact"}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-[10px] text-outline font-bold uppercase tracking-widest text-center py-12 opacity-30 italic">Empty Stage</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </DashboardShell>
  );
}
