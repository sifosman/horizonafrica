import { createClient } from "@/lib/supabase/server";
import { BroadcastForm, ContactsManager } from "@/components/broadcast-form";
import { BroadcastGroup, BroadcastHistory, BroadcastContact } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function BroadcastsPage() {
  const supabase = await createClient();

  const [groupsRes, historyRes, contactsRes] = await Promise.all([
    supabase.from("broadcast_groups").select("*").order("id"),
    supabase.from("broadcast_history").select("*").order("created_at", { ascending: false }),
    supabase.from("broadcast_contacts").select("*").order("created_at", { ascending: false }),
  ]);

  const groups = (groupsRes.data ?? []) as BroadcastGroup[];
  const history = (historyRes.data ?? []) as BroadcastHistory[];
  const contacts = (contactsRes.data ?? []) as BroadcastContact[];

  const contactCounts = groups.map((g) => ({
    ...g,
    count: contacts.filter((c) => c.group_id === g.id).length,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-on-surface">Broadcasts</h1>
        <p className="mt-1 text-sm text-on-surface-variant">
          Manage broadcast campaigns, groups, and contacts
        </p>
      </div>

      {/* Broadcast Group Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {contactCounts.map((g) => (
          <div key={g.id} className="card-shadow rounded-xl border border-surface-variant bg-surface-container-lowest p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">{g.group_label}</p>
                <p className="mt-1 text-3xl font-bold text-on-surface">{g.count}</p>
                <p className="text-xs text-on-surface-variant/60">contacts</p>
              </div>
              <div className="rounded-lg bg-secondary-container/20 px-3 py-2 text-xs font-semibold text-secondary">
                {g.group_name}
              </div>
            </div>
            {g.description && (
              <p className="mt-3 text-xs text-on-surface-variant">{g.description}</p>
            )}
          </div>
        ))}
      </div>

      {/* Broadcast History */}
      <div className="card-shadow rounded-xl border border-surface-variant bg-surface-container-lowest p-6">
        <h2 className="mb-5 text-lg font-semibold text-on-surface">Broadcast History</h2>
        {history.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant text-left text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                  <th className="pb-3">Campaign</th>
                  <th className="pb-3">Template</th>
                  <th className="pb-3">Sent</th>
                  <th className="pb-3">Delivered</th>
                  <th className="pb-3">Read</th>
                  <th className="pb-3">Failed</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.id} className="border-b border-outline-variant/30 last:border-0">
                    <td className="py-3 text-on-surface">{h.campaign_name}</td>
                    <td className="py-3 text-on-surface-variant">{h.template_name ?? "—"}</td>
                    <td className="py-3 text-on-surface-variant">{h.total_sent}</td>
                    <td className="py-3 text-on-surface-variant">{h.total_delivered}</td>
                    <td className="py-3 text-on-surface-variant">{h.total_read}</td>
                    <td className="py-3 text-on-surface-variant">{h.total_failed}</td>
                    <td className="py-3 capitalize text-on-surface-variant">{h.status}</td>
                    <td className="py-3 text-on-surface-variant">
                      {new Date(h.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-on-surface-variant">
            No broadcasts sent yet. Campaign history will appear here once WhatsApp is active.
          </p>
        )}
      </div>

      {/* Form + Contacts Manager */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <BroadcastForm groups={groups} />
        <ContactsManager groups={groups} contacts={contacts} />
      </div>
    </div>
  );
}
