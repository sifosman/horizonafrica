"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { BroadcastGroup, BroadcastContact } from "@/lib/types";
import { Send, Loader2, CheckCircle2, XCircle, Plus, Trash2, RefreshCw } from "lucide-react";

interface BroadcastFormProps {
  groups: BroadcastGroup[];
}

interface Template {
  name: string;
  label: string;
  status: string;
  category: string;
}

const FALLBACK_TEMPLATES: Template[] = [
  { name: "hello_world", label: "Hello World (Test)", status: "approved", category: "MARKETING" },
];

interface SendResult {
  broadcast_id: number;
  total_recipients: number;
  sent: number;
  failed: number;
  errors?: string[];
}

export function BroadcastForm({ groups }: BroadcastFormProps) {
  const [groupId, setGroupId] = useState<string>("");
  const [templates, setTemplates] = useState<Template[]>(FALLBACK_TEMPLATES);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [template, setTemplate] = useState<string>("hello_world");
  const [campaignName, setCampaignName] = useState("");
  const [testPhone, setTestPhone] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<SendResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    setTemplatesLoading(true);
    try {
      const res = await fetch("/api/broadcasts/templates");
      if (res.ok) {
        const data = await res.json();
        if (data.templates && data.templates.length > 0) {
          setTemplates(data.templates);
          if (!data.templates.some((t: Template) => t.name === template)) {
            setTemplate(data.templates[0].name);
          }
        }
        toast.success("Templates refreshed");
      } else {
        toast.error("Failed to refresh templates");
      }
    } catch {
      toast.error("Network error refreshing templates");
      // Keep fallback templates on error
    }
    setTemplatesLoading(false);
  }, [template]);

  useEffect(() => {
    fetchTemplates();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const selectedTemplate = templates.find((t) => t.name === template);
  const isTestMode = testPhone.trim().length > 0;
  const canSend = (isTestMode || groupId) && !sending;

  async function sendBroadcast() {
    setSending(true);
    setError(null);
    setResult(null);

    try {
      const payload: Record<string, unknown> = {
        template_name: template,
        campaign_name: campaignName || undefined,
      };

      if (isTestMode) {
        payload.test_phone = testPhone.trim();
      } else {
        payload.group_id = Number(groupId);
      }

      const res = await fetch("/api/broadcasts/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to send broadcast");
        toast.error(data.error ?? "Failed to send broadcast");
      } else {
        setResult(data);
        toast.success(`Broadcast sent: ${data.sent}/${data.total_recipients} successful`);
      }
    } catch {
      setError("Network error sending broadcast");
      toast.error("Network error sending broadcast");
    }

    setSending(false);
  }

  return (
    <div className="card-shadow rounded-xl border border-surface-variant bg-surface-container-lowest p-6">
      <h2 className="mb-5 text-lg font-semibold text-on-surface">New Broadcast</h2>
      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Campaign Name</label>
          <input
            type="text"
            value={campaignName}
            onChange={(e) => setCampaignName(e.target.value)}
            placeholder="e.g. July Welcome Campaign"
            className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2.5 text-sm focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/10"
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Template</label>
            <button
              type="button"
              onClick={fetchTemplates}
              disabled={templatesLoading}
              className="flex items-center gap-1 text-xs text-on-surface-variant transition hover:text-on-surface disabled:opacity-50"
              title="Refresh templates"
            >
              <RefreshCw className={`h-3 w-3 ${templatesLoading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
          <select
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            disabled={templatesLoading}
            className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2.5 text-sm focus:border-secondary focus:outline-none disabled:opacity-50"
          >
            {templatesLoading && (
              <option value="">Loading templates...</option>
            )}
            {templates.map((t) => (
              <option key={t.name} value={t.name}>
                {t.label} — {t.category}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Test Phone (optional)</label>
          <input
            type="tel"
            value={testPhone}
            onChange={(e) => setTestPhone(e.target.value)}
            placeholder="+27658475289"
            className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2.5 text-sm focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/10"
          />
          <p className="mt-1 text-xs text-on-surface-variant">
            Enter a phone number to send a single test message. Leave empty to send to a group.
          </p>
        </div>

        {!isTestMode && (
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Select Group</label>
            <select
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2.5 text-sm focus:border-secondary focus:outline-none"
            >
              <option value="">Choose a group...</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>{g.group_label} — {g.group_name}</option>
              ))}
            </select>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 rounded-lg bg-error-container/30 px-4 py-3 text-sm text-error">
            <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {result && (
          <div className="rounded-lg bg-secondary-container/20 px-4 py-3 text-sm">
            <div className="flex items-center gap-2 text-secondary">
              <CheckCircle2 className="h-4 w-4" />
              <span className="font-semibold">Broadcast Complete</span>
            </div>
            <div className="mt-2 space-y-1 text-on-surface-variant">
              <p>Sent: {result.sent} / {result.total_recipients}</p>
              {result.failed > 0 && <p className="text-error">Failed: {result.failed}</p>}
              {result.errors && result.errors.length > 0 && (
                <ul className="mt-1 list-inside list-disc text-xs text-error">
                  {result.errors.slice(0, 5).map((e, i) => (
                    <li key={i}>{e}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        <button
          onClick={sendBroadcast}
          disabled={!canSend}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-semibold text-on-primary shadow-lg transition-all hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {sending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              {isTestMode ? "Send Test Message" : "Send Broadcast"}
            </>
          )}
        </button>
      </div>
    </div>
  );
}

interface ContactsManagerProps {
  groups: BroadcastGroup[];
  contacts: BroadcastContact[];
}

export function ContactsManager({ groups, contacts: initialContacts }: ContactsManagerProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newGroup, setNewGroup] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [contacts, setContacts] = useState(initialContacts);

  async function addContact() {
    if (!newPhone || !newGroup) return;
    setSaving(true);
    setError(null);
    const res = await fetch("/api/broadcasts/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contact_name: newName || null,
        phone_number: newPhone,
        group_id: Number(newGroup),
      }),
    });
    if (res.ok) {
      const { contact } = await res.json();
      setContacts([...contacts, contact]);
      setShowAdd(false);
      setNewName("");
      setNewPhone("");
      setNewGroup("");
      toast.success("Contact added");
    } else {
      const { error } = await res.json();
      setError(error ?? "Failed to add contact");
      toast.error(error ?? "Failed to add contact");
    }
    setSaving(false);
  }

  async function deleteContact(id: string) {
    setDeletingId(id);
    const res = await fetch(`/api/broadcasts/contacts/${id}`, { method: "DELETE" });
    if (res.ok) {
      setContacts(contacts.filter((c) => String(c.id) !== id));
      toast.success("Contact deleted");
    } else {
      toast.error("Failed to delete contact");
    }
    setDeletingId(null);
  }

  return (
    <div className="card-shadow rounded-xl border border-surface-variant bg-surface-container-lowest p-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-on-surface">Contacts</h2>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-1.5 text-sm font-semibold text-on-secondary transition hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Add Contact
        </button>
      </div>

      {showAdd && (
        <div className="mb-4 flex flex-col gap-2 rounded-lg border border-outline-variant bg-surface-container-low p-3 sm:flex-row">
          <input
            type="text"
            placeholder="Name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="flex-1 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm focus:border-secondary focus:outline-none"
          />
          <input
            type="text"
            placeholder="Phone (+27...)"
            value={newPhone}
            onChange={(e) => setNewPhone(e.target.value)}
            className="flex-1 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm focus:border-secondary focus:outline-none"
          />
          <select
            value={newGroup}
            onChange={(e) => setNewGroup(e.target.value)}
            className="rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm focus:border-secondary focus:outline-none"
          >
            <option value="">Select group...</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>{g.group_label}</option>
            ))}
          </select>
          <button
            onClick={addContact}
            disabled={saving || !newPhone || !newGroup}
            className="flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-sm font-semibold text-on-secondary transition hover:opacity-90 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      )}

      {error && (
        <p className="mb-3 rounded-lg bg-error-container/30 px-3 py-2 text-sm text-error">{error}</p>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-outline-variant text-left text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
              <th className="pb-2">Name</th>
              <th className="pb-2">Phone</th>
              <th className="pb-2">Group</th>
              <th className="pb-2">Opt-in</th>
              <th className="pb-2"></th>
            </tr>
          </thead>
          <tbody>
            {contacts.length > 0 ? (
              contacts.map((c) => {
                const group = groups.find((g) => g.id === c.group_id);
                return (
                  <tr key={c.id} className="border-b border-outline-variant/30 last:border-0">
                    <td className="py-2.5 text-on-surface">{c.contact_name ?? "—"}</td>
                    <td className="py-2.5 text-on-surface-variant">{c.phone_number}</td>
                    <td className="py-2.5 text-on-surface-variant">{group?.group_label ?? "—"}</td>
                    <td className="py-2.5">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold ${c.opt_in ? "bg-secondary-container/30 text-secondary" : "bg-surface-container-high text-on-surface-variant"}`}>
                        {c.opt_in ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="py-2.5">
                      <button
                        onClick={() => deleteContact(String(c.id))}
                        disabled={deletingId === String(c.id)}
                        className="text-on-surface-variant transition hover:text-error disabled:opacity-50"
                      >
                        {deletingId === String(c.id) ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="py-8 text-center text-on-surface-variant">
                  No contacts added yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
