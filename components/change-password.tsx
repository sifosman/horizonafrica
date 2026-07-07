"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { DashboardShell } from "@/components/dashboard-shell";

export function ChangePasswordClient({
  clinicName,
  role,
}: {
  clinicName: string;
  role: string;
}) {
  const supabase = createClient();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  return (
    <DashboardShell
      clinicName={clinicName}
      role={role}
      title="Change Password"
      description="Set a new password for your account."
      currentPath="/team"
    >
      <div className="max-w-md">
        <div className="bg-surface-container-lowest rounded-3xl shadow-sm border border-surface-container p-8">
          {success ? (
            <div className="text-center space-y-4">
              <span className="material-symbols-outlined text-6xl text-primary block">check_circle</span>
              <h3 className="text-xl font-bold text-primary">Password Updated!</h3>
              <p className="text-on-surface-variant">
                Your password has been changed successfully. Use this new password the next time you log in.
              </p>
            </div>
          ) : (
            <>
              <h3 className="text-xl font-bold text-primary mb-2">Set New Password</h3>
              <p className="text-on-surface-variant text-sm mb-6">
                Choose a strong password (minimum 8 characters).
              </p>

              {error && (
                <div className="mb-4 p-4 bg-error-container/10 text-on-error-container rounded-2xl text-sm border border-error-container/20">
                  {error}
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-outline uppercase tracking-widest mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-surface-container-low rounded-2xl border border-outline-variant/20 text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    placeholder="Min 8 characters"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-outline uppercase tracking-widest mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-surface-container-low rounded-2xl border border-outline-variant/20 text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    placeholder="Re-enter password"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-primary text-on-primary rounded-full font-medium hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
                >
                  {loading ? "Updating..." : "Update Password"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
