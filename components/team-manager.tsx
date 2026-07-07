"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { DashboardShell } from "@/components/dashboard-shell";

type TeamMember = {
  id: string;
  email: string;
  role: string;
  created_at: string;
};

type InviteResult = {
  email: string;
  tempPassword: string;
  role: string;
};

export function TeamClient({
  clinicName,
  role,
  tenantId,
}: {
  clinicName: string;
  role: string;
  tenantId: string;
}) {
  const supabase = createClient();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("staff");
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<InviteResult | null>(null);

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("users")
      .select("id, email, role, created_at")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: true });

    setMembers(data || []);
    setLoading(false);
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true);
    setError("");
    setSuccess(null);

    try {
      const response = await fetch("/api/team/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Failed to invite team member");
        setInviting(false);
        return;
      }

      setSuccess({
        email: inviteEmail,
        tempPassword: result.tempPassword,
        role: inviteRole,
      });
      setInviteEmail("");
      setInviteRole("staff");
      loadMembers();
    } catch {
      setError("Network error. Please try again.");
    }

    setInviting(false);
  };

  const handleRemove = async (memberId: string, memberEmail: string) => {
    if (!confirm(`Remove ${memberEmail} from the team?`)) return;

    const { error: deleteError } = await supabase
      .from("users")
      .delete()
      .eq("id", memberId);

    if (deleteError) {
      setError("Failed to remove team member");
      return;
    }

    loadMembers();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <DashboardShell
      clinicName={clinicName}
      role={role}
      title="Team"
      description="Invite staff members to access your clinic dashboard."
      currentPath="/team"
    >
      <div className="space-y-8">
        {/* Invite Form */}
        <div className="bg-surface-container-lowest rounded-3xl shadow-sm border border-surface-container p-8">
          <h3 className="text-xl font-bold text-primary mb-2">Invite Team Member</h3>
          <p className="text-on-surface-variant text-sm mb-6">
            Enter their email address and choose a role. A temporary password will be generated for them to share.
          </p>

          {error && (
            <div className="mb-4 p-4 bg-error-container/10 text-on-error-container rounded-2xl text-sm border border-error-container/20">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-6 bg-secondary-container/10 rounded-2xl border border-secondary-container/20 space-y-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">check_circle</span>
                <h4 className="font-bold text-primary">Team member created successfully!</h4>
              </div>
              <p className="text-sm text-on-surface-variant">
                Share these login details with <strong>{success.email}</strong>. They should change their password after first login.
              </p>
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center justify-between p-3 bg-surface-container-low rounded-xl border border-outline-variant/20">
                  <div>
                    <p className="text-[10px] font-bold text-outline uppercase tracking-widest">Login URL</p>
                    <p className="text-sm font-mono text-on-surface">
                      {typeof window !== "undefined" ? `${window.location.origin}/login` : "/login"}
                    </p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(typeof window !== "undefined" ? `${window.location.origin}/login` : "/login")}
                    className="material-symbols-outlined text-on-surface-variant hover:text-primary cursor-pointer"
                  >
                    content_copy
                  </button>
                </div>
                <div className="flex items-center justify-between p-3 bg-surface-container-low rounded-xl border border-outline-variant/20">
                  <div>
                    <p className="text-[10px] font-bold text-outline uppercase tracking-widest">Email</p>
                    <p className="text-sm font-mono text-on-surface">{success.email}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(success.email)}
                    className="material-symbols-outlined text-on-surface-variant hover:text-primary cursor-pointer"
                  >
                    content_copy
                  </button>
                </div>
                <div className="flex items-center justify-between p-3 bg-primary-container/10 rounded-xl border border-primary-container/20">
                  <div>
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Temporary Password</p>
                    <p className="text-sm font-mono text-primary font-bold">{success.tempPassword}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(success.tempPassword)}
                    className="material-symbols-outlined text-primary hover:text-primary cursor-pointer"
                  >
                    content_copy
                  </button>
                </div>
              </div>
              <button
                onClick={() => setSuccess(null)}
                className="text-sm text-primary font-bold uppercase tracking-widest hover:underline"
              >
                Dismiss
              </button>
            </div>
          )}

          <form onSubmit={handleInvite} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-outline uppercase tracking-widest mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-surface-container-low rounded-2xl border border-outline-variant/20 text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  placeholder="reception@clinic.co.za"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-outline uppercase tracking-widest mb-2">
                  Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full px-4 py-3 bg-surface-container-low rounded-2xl border border-outline-variant/20 text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                >
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              disabled={inviting || !inviteEmail}
              className="px-8 py-3 bg-primary text-on-primary rounded-full font-medium hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">person_add</span>
              {inviting ? "Creating..." : "Create & Generate Login Details"}
            </button>
          </form>
        </div>

        {/* Team Members List */}
        <div className="bg-surface-container-lowest rounded-3xl shadow-sm border border-surface-container p-8">
          <h3 className="text-xl font-bold text-primary mb-6">Team Members</h3>

          {loading ? (
            <div className="py-8 text-center text-outline">Loading...</div>
          ) : members.length === 0 ? (
            <div className="py-8 text-center text-outline italic">No team members yet</div>
          ) : (
            <div className="space-y-3">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 bg-surface-container-low rounded-2xl border border-outline-variant/20 hover:bg-surface-container transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center text-primary font-bold">
                      {member.email.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-on-surface">{member.email}</p>
                      <p className="text-xs text-on-surface-variant">
                        {new Date(member.created_at).toLocaleDateString("en-ZA", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                        member.role === "admin"
                          ? "bg-primary/10 text-primary"
                          : "bg-surface-container-high text-outline"
                      }`}
                    >
                      {member.role}
                    </span>
                    {member.id !== members.find((m) => m.role === "admin")?.id && (
                      <button
                        onClick={() => handleRemove(member.id, member.email)}
                        className="material-symbols-outlined text-on-surface-variant hover:text-error cursor-pointer transition-colors"
                        title="Remove member"
                      >
                        person_remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
