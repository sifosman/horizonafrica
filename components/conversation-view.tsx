"use client";

import { useState, useMemo } from "react";
import { Conversation, LeadScore } from "@/lib/types";
import { ScoreBadge } from "@/components/score-badge";
import { Search, X, MessageSquare, Bot } from "lucide-react";

interface ConversationViewProps {
  conversations: Conversation[];
}

const scoreOptions: (LeadScore | "ALL")[] = ["ALL", "HOT", "WARM", "COLD"];

export function ConversationView({ conversations }: ConversationViewProps) {
  const [search, setSearch] = useState("");
  const [scoreFilter, setScoreFilter] = useState<LeadScore | "ALL">("ALL");
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return conversations.filter((c) => {
      const matchesSearch =
        !search ||
        c.contact_name?.toLowerCase().includes(search.toLowerCase()) ||
        c.phone_number.includes(search);
      const matchesScore = scoreFilter === "ALL" || c.lead_score === scoreFilter;
      return matchesSearch && matchesScore;
    });
  }, [conversations, search, scoreFilter]);

  const grouped = useMemo(() => {
    const map = new Map<string, Conversation[]>();
    filtered.forEach((c) => {
      const key = c.phone_number;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(c);
    });
    return Array.from(map.entries()).sort((a, b) => {
      const aLast = a[1][a[1].length - 1];
      const bLast = b[1][b[1].length - 1];
      return new Date(bLast.created_at).getTime() - new Date(aLast.created_at).getTime();
    });
  }, [filtered]);

  const selectedMessages = selectedPhone
    ? conversations.filter((c) => c.phone_number === selectedPhone).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    : [];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
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
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-2 max-h-[600px] overflow-y-auto">
          {grouped.length > 0 ? (
            grouped.map(([phone, msgs]) => {
              const last = msgs[msgs.length - 1];
              const isSelected = selectedPhone === phone;
              return (
                <button
                  key={phone}
                  onClick={() => setSelectedPhone(phone)}
                  className={`w-full rounded-lg border p-3 text-left transition ${
                    isSelected ? "border-primary-500 bg-primary-50" : "border-outline bg-surface hover:bg-surface-variant/30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-on-surface">
                      {last.contact_name ?? phone}
                    </p>
                    <ScoreBadge score={last.lead_score as LeadScore} />
                  </div>
                  <p className="mt-1 truncate text-xs text-on-surface-variant">
                    {last.incoming_message ?? "—"}
                  </p>
                  <p className="mt-1 text-xs text-on-surface-variant/60">
                    {msgs.length} messages · {new Date(last.created_at).toLocaleDateString()}
                  </p>
                </button>
              );
            })
          ) : (
            <p className="py-8 text-center text-sm text-on-surface-variant">
              No conversations found.
            </p>
          )}
        </div>

        <div className="lg:col-span-2 rounded-xl border border-outline bg-surface">
          {selectedPhone ? (
            <div className="flex h-[600px] flex-col">
              <div className="flex items-center justify-between border-b border-outline px-4 py-3">
                <div>
                  <p className="font-medium text-on-surface">
                    {selectedMessages[0]?.contact_name ?? selectedPhone}
                  </p>
                  <p className="text-xs text-on-surface-variant">{selectedPhone}</p>
                </div>
                <button onClick={() => setSelectedPhone(null)} className="text-on-surface-variant hover:text-on-surface">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 space-y-4 overflow-y-auto p-4">
                {selectedMessages.map((msg) => (
                  <div key={msg.id} className="space-y-2">
                    {msg.incoming_message && (
                      <div className="flex items-start gap-2">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-variant">
                          <MessageSquare className="h-4 w-4 text-on-surface-variant" />
                        </div>
                        <div className="rounded-lg bg-surface-variant px-4 py-2 max-w-[75%]">
                          <p className="text-sm text-on-surface">{msg.incoming_message}</p>
                          <p className="mt-1 text-xs text-on-surface-variant/60">
                            {new Date(msg.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    )}
                    {msg.ai_response && (
                      <div className="flex items-start gap-2 justify-end">
                        <div className="rounded-lg bg-primary-600 px-4 py-2 max-w-[75%]">
                          <p className="text-sm text-white">{msg.ai_response}</p>
                          <p className="mt-1 text-xs text-primary-100">
                            {new Date(msg.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100">
                          <Bot className="h-4 w-4 text-primary-600" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex h-[600px] items-center justify-center">
              <p className="text-sm text-on-surface-variant">
                Select a conversation to view message history
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
