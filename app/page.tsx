import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-5xl font-bold tracking-tight">
          SA Aesthetics Bot
        </h1>
        <p className="text-xl text-slate-300">
          WhatsApp Patient Intake & Triage Platform for South African Aesthetic Clinics
        </p>
        <div className="flex gap-4 justify-center pt-4">
          <Link
            href="/login"
            className="px-6 py-3 bg-primary-600 hover:bg-primary-700 rounded-lg font-medium transition"
          >
            Clinic Login
          </Link>
          <Link
            href="/onboard"
            className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg font-medium transition"
          >
            Onboard Clinic
          </Link>
        </div>
      </div>
    </main>
  );
}
