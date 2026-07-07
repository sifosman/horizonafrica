import { createClient } from "@/lib/supabase/server";
import { LeadTable } from "@/components/lead-table";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const supabase = await createClient();
  const { data: leads } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-on-surface">Leads</h1>
        <p className="mt-1 text-sm text-on-surface-variant">
          Manage and track all sales leads from WhatsApp conversations
        </p>
      </div>
      <LeadTable leads={leads ?? []} />
    </div>
  );
}
