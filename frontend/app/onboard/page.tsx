"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function OnboardPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tenantId, setTenantId] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const [clinicName, setClinicName] = useState("");
  const [slug, setSlug] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  const createTenant = async () => {
    setLoading(true);
    setError("");

    const { data: tenant, error: tenantError } = await supabase
      .from("tenants")
      .insert({ name: clinicName, slug, whatsapp_number: whatsapp })
      .select()
      .single();

    if (tenantError || !tenant) {
      setError(tenantError?.message || "Failed to create clinic");
      setLoading(false);
      return;
    }

    setTenantId(tenant.id);
    setStep(2);
    setLoading(false);
  };

  const createAdmin = async () => {
    setLoading(true);
    setError("");

    const { error: signUpError } = await supabase.auth.signUp({
      email: adminEmail,
      password: adminPassword,
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    const { error: userError } = await supabase.from("users").insert({
      tenant_id: tenantId,
      email: adminEmail,
      role: "admin",
    });

    if (userError) {
      setError(userError.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <div className="w-full max-w-lg bg-white rounded-xl p-8 shadow-2xl">
        <div className="flex items-center gap-2 mb-6">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === 1 ? "bg-primary-600 text-white" : "bg-primary-100 text-primary-700"}`}>1</div>
          <div className="h-1 flex-1 bg-slate-200 rounded">
            <div className={`h-full bg-primary-600 rounded transition-all ${step === 1 ? "w-1/2" : "w-full"}`} />
          </div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === 2 ? "bg-primary-600 text-white" : "bg-slate-200 text-slate-500"}`}>2</div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
        )}

        {step === 1 && (
          <>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">Clinic Details</h1>
            <p className="text-slate-500 mb-6">Set up your clinic on SA Aesthetics Bot</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Clinic Name</label>
                <input
                  type="text"
                  required
                  value={clinicName}
                  onChange={(e) => { setClinicName(e.target.value); setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")); }}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Aesthetics by Dr. Smith"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Slug (URL identifier)</label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="dr-smith-aesthetics"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">WhatsApp Number (for bot)</label>
                <input
                  type="text"
                  required
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="+27 82 123 4567"
                />
              </div>
              <button
                onClick={createTenant}
                disabled={loading || !clinicName || !slug || !whatsapp}
                className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition disabled:opacity-50"
              >
                {loading ? "Creating..." : "Continue"}
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">Admin Account</h1>
            <p className="text-slate-500 mb-6">Create your dashboard login</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Admin Email</label>
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="admin@clinic.co.za"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Min 8 characters"
                />
              </div>
              <button
                onClick={createAdmin}
                disabled={loading || !adminEmail || !adminPassword}
                className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition disabled:opacity-50"
              >
                {loading ? "Creating..." : "Complete Setup"}
              </button>
            </div>
          </>
        )}

        <p className="mt-4 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link href="/login" className="text-primary-600 hover:underline">Log in</Link>
        </p>
      </div>
    </main>
  );
}
