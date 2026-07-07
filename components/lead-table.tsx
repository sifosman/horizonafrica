"use client";

import { useState, useMemo } from "react";
import { Lead, LeadScore, LeadStatus } from "@/lib/types";
import { ScoreBadge } from "@/components/score-badge";
import { Search, Download, X, Save } from "lucide-react";

interface LeadTableProps {
  leads: Lead[];
}

const scoreOptions: (LeadScore | "ALL")[] = ["ALL", "HOT", "WARM", "COLD"];
const statusOptions: (LeadStatus | "ALL")[] = ["ALL", "new", "contacted", "qualified", "converted", "lost"];

export function LeadTable({ leads }: LeadTableProps) {
  const [search, setSearch] = useState("");
  const [scoreFilter, setScoreFilter] = useState<LeadScore | "ALL">("ALL");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "ALL">("ALL");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const filtered = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch =
        !search ||
        lead.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        lead.phone_number.includes(search);
      const matchesScore = scoreFilter === "ALL" || lead.lead_score === scoreFilter;
      const matchesStatus = statusFilter === "ALL" || lead.status === statusFilter;
      return matchesSearch && matchesScore && matchesStatus;
    });
  }, [leads, search, scoreFilter, statusFilter]);

  function exportCSV() {
    const params = new URLSearchParams();
    if (scoreFilter !== "ALL") params.set("score", scoreFilter);
    if (statusFilter !== "ALL") params.set("status", statusFilter);
    if (search) params.set("search", search);
    window.open(`/api/leads/export?${params.toString()}`, "_blank");
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant/50" />
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-outline bg-surface py-2 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
          <select
            value={scoreFilter}
            onChange={(e) => setScoreFilter(e.target.value as LeadScore | "ALL")}
            className="rounded-lg border border-outline bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
          >
            {scoreOptions.map((s) => (
              <option key={s} value={s}>{s === "ALL" ? "All Scores" : s}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as LeadStatus | "ALL")}
            className="rounded-lg border border-outline bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
          >
            {statusOptions.map((s) => (
              <option key={s} value={s}>{s === "ALL" ? "All Statuses" : s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-700"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-outline bg-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-outline bg-surface-variant/50 text-left text-on-surface-variant">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Phone</th>
              <th className="px-4 py-3 font-medium">Product Interest</th>
              <th className="px-4 py-3 font-medium">Score</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Created</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((lead) => (
                <tr
                  key={lead.id}
                  onClick={() => setSelectedLead(lead)}
                  className="cursor-pointer border-b border-outline/50 transition hover:bg-surface-variant/30"
                >
                  <td className="px-4 py-3 text-on-surface">{lead.full_name ?? "—"}</td>
                  <td className="px-4 py-3 text-on-surface-variant">{lead.phone_number}</td>
                  <td className="px-4 py-3 text-on-surface-variant">{lead.product_interest ?? "—"}</td>
                  <td className="px-4 py-3"><ScoreBadge score={lead.lead_score} /></td>
                  <td className="px-4 py-3 capitalize text-on-surface-variant">{lead.status}</td>
                  <td className="px-4 py-3 text-on-surface-variant">
                    {new Date(lead.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-on-surface-variant">
                  No leads found matching your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-sm text-on-surface-variant">
        Showing {filtered.length} of {leads.length} leads
      </p>

      {selectedLead && (
        <LeadDetailDrawer lead={selectedLead} onClose={() => setSelectedLead(null)} />
      )}
    </div>
  );
}

function LeadDetailDrawer({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editScore, setEditScore] = useState<LeadScore>(lead.lead_score);
  const [editStatus, setEditStatus] = useState<LeadStatus>(lead.status);
  const [editNotes, setEditNotes] = useState<string>(lead.notes ?? "");
  const [currentLead, setCurrentLead] = useState(lead);

  async function saveLead() {
    setSaving(true);
    const res = await fetch(`/api/leads/${currentLead.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lead_score: editScore,
        status: editStatus,
        notes: editNotes,
      }),
    });
    if (res.ok) {
      const { lead: updated } = await res.json();
      setCurrentLead(updated);
      setEditing(false);
    }
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md overflow-y-auto bg-surface shadow-xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-outline bg-surface px-6 py-4">
          <h2 className="font-semibold text-on-surface">Lead Details</h2>
          <div className="flex items-center gap-2">
            {editing ? (
              <button
                onClick={saveLead}
                disabled={saving}
                className="flex items-center gap-1.5 rounded-lg bg-primary-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-primary-700 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {saving ? "Saving..." : "Save"}
              </button>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="rounded-lg border border-outline px-3 py-1.5 text-sm font-medium text-on-surface-variant transition hover:bg-surface-variant"
              >
                Edit
              </button>
            )}
            <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="space-y-4 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-lg font-semibold text-primary-700">
              {(currentLead.full_name ?? currentLead.phone_number).charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-on-surface">{currentLead.full_name ?? "Unknown"}</p>
              <p className="text-sm text-on-surface-variant">{currentLead.phone_number}</p>
            </div>
            <div className="ml-auto">
              {editing ? (
                <select
                  value={editScore}
                  onChange={(e) => setEditScore(e.target.value as LeadScore)}
                  className="rounded-lg border border-outline bg-surface px-2 py-1 text-xs focus:border-primary-500 focus:outline-none"
                >
                  <option value="HOT">HOT</option>
                  <option value="WARM">WARM</option>
                  <option value="COLD">COLD</option>
                </select>
              ) : (
                <ScoreBadge score={currentLead.lead_score} />
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            {editing ? (
              <>
                <div>
                  <p className="text-xs font-medium text-on-surface-variant">Status</p>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as LeadStatus)}
                    className="mt-0.5 w-full rounded-lg border border-outline bg-surface px-2 py-1.5 text-sm focus:border-primary-500 focus:outline-none"
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="qualified">Qualified</option>
                    <option value="converted">Converted</option>
                    <option value="lost">Lost</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <p className="text-xs font-medium text-on-surface-variant">Notes</p>
                  <textarea
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    rows={3}
                    className="mt-0.5 w-full rounded-lg border border-outline bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>
              </>
            ) : (
              <>
                <Field label="Status" value={currentLead.status} capitalize />
                <Field label="Email" value={currentLead.email} />
                <Field label="Product Interest" value={currentLead.product_interest} />
                <Field label="Recommended Package" value={currentLead.recommended_package} />
                <Field label="Household Size" value={currentLead.household_size} />
                <Field label="Internet Usage" value={currentLead.internet_usage} />
                <Field label="Physical Address" value={currentLead.physical_address} fullWidth />
                <Field label="Notes" value={currentLead.notes} fullWidth />
              </>
            )}
            <Field label="Created" value={new Date(currentLead.created_at).toLocaleString()} />
            <Field label="Updated" value={new Date(currentLead.updated_at).toLocaleString()} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, fullWidth, capitalize }: { label: string; value: string | null; fullWidth?: boolean; capitalize?: boolean }) {
  return (
    <div className={fullWidth ? "col-span-2" : ""}>
      <p className="text-xs font-medium text-on-surface-variant">{label}</p>
      <p className={`mt-0.5 text-on-surface ${capitalize ? "capitalize" : ""}`}>{value ?? "—"}</p>
    </div>
  );
}
