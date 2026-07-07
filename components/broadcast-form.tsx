"use client";

import { useState } from "react";
import { BroadcastGroup, BroadcastContact, BroadcastHistory } from "@/lib/types";
import { Send, Plus, Trash2, Lock } from "lucide-react";

interface BroadcastFormProps {
  groups: BroadcastGroup[];
}

const templates = [
  "promotional_offer",
  "new_product_alert",
  "follow_up_reminder",
  "seasonal_deal",
  "service_update",
];

export function BroadcastForm({ groups }: BroadcastFormProps) {
  const [groupId, setGroupId] = useState<string>("");
  const [template, setTemplate] = useState<string>(templates[0]);
  const [message, setMessage] = useState("");

  const selectedGroup = groups.find((g) => String(g.id) === groupId);

  return (
    <div className="rounded-xl border border-outline bg-surface p-5">
      <h2 className="mb-4 font-semibold text-on-surface">New Broadcast</h2>
      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-on-surface-variant">Select Group</label>
          <select
            value={groupId}
            onChange={(e) => setGroupId(e.target.value)}
            className="w-full rounded-lg border border-outline bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
          >
            <option value="">Choose a group...</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>{g.group_label} — {g.group_name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-on-surface-variant">Template</label>
          <select
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            className="w-full rounded-lg border border-outline bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
          >
            {templates.map((t) => (
              <option key={t} value={t}>{t.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-on-surface-variant">Message Preview</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            placeholder="Type your broadcast message..."
            className="w-full rounded-lg border border-outline bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            disabled
            title="Requires Meta WhatsApp Business API approval"
            className="flex cursor-not-allowed items-center gap-2 rounded-lg bg-surface-variant px-4 py-2 text-sm font-medium text-on-surface-variant/50"
          >
            <Lock className="h-4 w-4" />
            Send Broadcast
          </button>
          <span className="text-xs text-on-surface-variant">
            Requires Meta WhatsApp Business API approval
          </span>
        </div>
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
    } else {
      const { error } = await res.json();
      setError(error ?? "Failed to add contact");
    }
    setSaving(false);
  }

  async function deleteContact(id: string) {
    const res = await fetch(`/api/broadcasts/contacts/${id}`, { method: "DELETE" });
    if (res.ok) {
      setContacts(contacts.filter((c) => String(c.id) !== id));
    }
  }

  return (
    <div className="rounded-xl border border-outline bg-surface p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold text-on-surface">Contacts</h2>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 rounded-lg bg-primary-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-primary-700"
        >
          <Plus className="h-4 w-4" />
          Add Contact
        </button>
      </div>

      {showAdd && (
        <div className="mb-4 flex flex-col gap-2 rounded-lg border border-outline bg-surface-variant/30 p-3 sm:flex-row">
          <input
            type="text"
            placeholder="Name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="flex-1 rounded-lg border border-outline bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
          />
          <input
            type="text"
            placeholder="Phone (+27...)"
            value={newPhone}
            onChange={(e) => setNewPhone(e.target.value)}
            className="flex-1 rounded-lg border border-outline bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
          />
          <select
            value={newGroup}
            onChange={(e) => setNewGroup(e.target.value)}
            className="rounded-lg border border-outline bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
          >
            <option value="">Select group...</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>{g.group_label}</option>
            ))}
          </select>
          <button
            onClick={addContact}
            disabled={saving || !newPhone || !newGroup}
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      )}

      {error && (
        <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-outline text-left text-on-surface-variant">
              <th className="pb-2 font-medium">Name</th>
              <th className="pb-2 font-medium">Phone</th>
              <th className="pb-2 font-medium">Group</th>
              <th className="pb-2 font-medium">Opt-in</th>
              <th className="pb-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {contacts.length > 0 ? (
              contacts.map((c) => {
                const group = groups.find((g) => g.id === c.group_id);
                return (
                  <tr key={c.id} className="border-b border-outline/50">
                    <td className="py-2.5 text-on-surface">{c.contact_name ?? "—"}</td>
                    <td className="py-2.5 text-on-surface-variant">{c.phone_number}</td>
                    <td className="py-2.5 text-on-surface-variant">{group?.group_label ?? "—"}</td>
                    <td className="py-2.5">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${c.opt_in ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {c.opt_in ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="py-2.5">
                      <button onClick={() => deleteContact(String(c.id))} className="text-on-surface-variant hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
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
