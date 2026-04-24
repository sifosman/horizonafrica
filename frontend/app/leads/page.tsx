import { DashboardShell } from "@/components/dashboard-shell";
import { getDashboardContext } from "@/lib/dashboard";

const leadColumns = ["new", "qualified", "contacted", "booked", "converted", "lost"];

export default async function LeadsPage() {
  const { supabase, staff } = await getDashboardContext();

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
      <div className="grid grid-cols-1 xl:grid-cols-6 gap-4">
        {leadColumns.map((column) => {
          const items = (leads ?? []).filter((lead) => lead.status === column);
          return (
            <div key={column} className="bg-white rounded-xl border border-slate-200 shadow-sm min-h-[240px]">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-semibold text-slate-900 capitalize">{column}</h3>
                <span className="text-xs text-slate-500">{items.length}</span>
              </div>
              <div className="p-4 space-y-3">
                {items.length ? (
                  items.map((lead) => (
                    <div key={lead.id} className="rounded-lg border border-slate-200 p-3 bg-slate-50 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium text-slate-900">{lead.phone_number}</p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          lead.lead_score === "hot"
                            ? "bg-red-100 text-red-700"
                            : lead.lead_score === "warm"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-slate-200 text-slate-700"
                        }`}>
                          {lead.lead_score || "unscored"}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600">{lead.interest_service || "Service not captured"}</p>
                      <p className="text-xs text-slate-400">Budget: {lead.budget_indication || "unknown"}</p>
                      <p className="text-xs text-slate-400">Last contact: {lead.last_contact_at ? new Date(lead.last_contact_at).toLocaleString("en-ZA") : "None"}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-slate-400 text-center py-8">No leads in this stage.</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </DashboardShell>
  );
}
