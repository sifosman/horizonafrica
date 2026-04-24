import Link from "next/link";
import { dashboardLinks } from "@/lib/dashboard";

type DashboardShellProps = {
  clinicName: string;
  role: string;
  title: string;
  description: string;
  currentPath: string;
  children: React.ReactNode;
};

export function DashboardShell({
  clinicName,
  role,
  title,
  description,
  currentPath,
  children,
}: DashboardShellProps) {
  return (
    <main className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">{clinicName}</h1>
            <p className="text-sm text-slate-500">{role} | SA Aesthetics Bot</p>
          </div>
          <div className="flex gap-3">
            <form action="/auth/signout" method="post">
              <button className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-sm font-medium transition">
                Sign Out
              </button>
            </form>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 pb-4 flex flex-wrap gap-2">
          {dashboardLinks.map((link) => {
            const active = currentPath === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  active
                    ? "bg-primary-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
          <p className="text-sm text-slate-500 mt-1">{description}</p>
        </div>
        {children}
      </section>
    </main>
  );
}
