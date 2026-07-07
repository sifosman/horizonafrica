"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Lock, Mail, Eye, EyeOff, ArrowRight, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#131b2e] px-4 font-sans text-white">
      {/* Dot pattern background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          backgroundImage: "radial-gradient(rgba(255, 255, 255, 0.05) 0.5px, transparent 0.5px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Atmospheric blur decorations */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-primary-container/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-tertiary-container/10 blur-3xl" />

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md">
        <div
          className="rounded-xl border border-white/10 bg-white/[0.08] p-6 backdrop-blur-xl"
          style={{ boxShadow: "0px 10px 30px -5px rgba(0, 0, 0, 0.3)" }}
        >
          {/* Brand Header */}
          <div className="mb-6 flex flex-col items-center">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-container text-sm font-bold text-on-primary-container">
              HA
            </div>
            <div className="text-center">
              <h1 className="mb-1 text-2xl font-semibold text-white">Welcome back</h1>
              <p className="text-sm text-white/60">Please enter your details to sign in</p>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="ml-1 block text-xs font-semibold tracking-wide text-white/60"
              >
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white outline-none transition-all placeholder:text-white/30 focus:border-primary-container focus:ring-2 focus:ring-primary-container/30"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="ml-1 block text-xs font-semibold tracking-wide text-white/60"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 pl-10 pr-12 text-sm text-white outline-none transition-all placeholder:text-white/30 focus:border-primary-container focus:ring-2 focus:ring-primary-container/30"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 transition-colors hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  id="remember"
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-white/5 accent-primary-container"
                />
                <label
                  htmlFor="remember"
                  className="cursor-pointer text-[13px] text-white/60"
                >
                  Remember me
                </label>
              </div>
              <a
                href="#"
                className="text-[13px] font-semibold text-primary-container transition-colors hover:underline"
              >
                Forgot password?
              </a>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Primary CTA */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-container py-3 text-base font-semibold text-on-primary-container shadow-lg transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>

          </form>

          {/* Footer Link */}
          <div className="mt-6 text-center">
            <p className="text-[13px] text-white/60">
              Don&apos;t have an account?{" "}
              <a
                href="#"
                className="font-semibold text-primary-container transition-colors hover:underline"
              >
                Contact Administrator
              </a>
            </p>
          </div>
        </div>

        {/* Security Badge */}
        <div className="mt-4 flex items-center justify-center gap-2 opacity-40 transition-all hover:opacity-100">
          <ShieldCheck className="h-4 w-4 text-white" />
          <span className="text-[11px] font-medium uppercase tracking-widest text-white">
            Enterprise Secure
          </span>
        </div>
      </div>
    </div>
  );
}
