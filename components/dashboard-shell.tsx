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
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="hidden md:flex h-screen w-72 fixed left-0 top-0 flex-col py-8 border-r border-outline-variant/30 bg-surface-container-lowest shadow-[8px_0_24px_-12px_rgba(119,90,25,0.08)] z-50">
        <div className="px-8 mb-10">
          <h1 className="font-sans text-xl text-primary font-bold">{clinicName}</h1>
          <p className="text-on-surface-variant text-sm tracking-wide">Luxury Wellness</p>
        </div>

        <nav className="flex-1 space-y-1 px-4">
          {dashboardLinks.map((link) => {
            const active = currentPath === link.href;
            const iconMap: Record<string, string> = {
              "/dashboard": "dashboard",
              "/appointments": "calendar_month",
              "/patients": "group",
              "/conversations": "chat_bubble",
              "/leads": "person_search",
              "/settings": "settings",
              "/team": "group_add",
            };

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-4 px-6 py-3 rounded-full transition-all duration-300 ${
                  active
                    ? "bg-secondary-container text-on-secondary-container font-medium border-l-4 border-primary"
                    : "text-on-surface-variant hover:text-primary hover:bg-surface-container-high"
                }`}
              >
                <span className="material-symbols-outlined">{iconMap[link.href] || "circle"}</span>
                <span className="text-sm">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="px-8 mt-auto mb-4">
          <Link
            href="/appointments"
            className="w-full bg-primary text-on-primary py-3 rounded-full hover:opacity-90 active:scale-95 transition-all shadow-md flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            New Appointment
          </Link>
        </div>

        <div className="px-4 border-t border-outline-variant/20 pt-6">
          <form action="/auth/signout" method="post">
            <button className="w-full flex items-center gap-4 text-on-surface-variant px-6 py-3 hover:text-error rounded-full transition-all">
              <span className="material-symbols-outlined">logout</span>
              <span className="text-sm">Sign Out</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="md:ml-72 flex-1 flex flex-col h-screen overflow-hidden">
        {/* TopAppBar */}
        <header className="w-full sticky top-0 bg-surface shadow-sm flex justify-between items-center px-gutter py-4 z-40 h-20">
          <div className="flex items-center gap-4">
            <span className="md:hidden material-symbols-outlined text-primary cursor-pointer">menu</span>
            <h2 className="text-xl text-primary tracking-tight font-bold">{title}</h2>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-full bg-primary-container/10 border border-primary-container/20">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span className="text-xs font-semibold text-primary">AI Active</span>
            </div>

            <div className="flex items-center gap-4">
              <button className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary transition-colors">
                notifications
              </button>
              <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-primary-container">
                <div className="bg-secondary-container w-full h-full flex items-center justify-center text-primary font-bold">
                  {clinicName.charAt(0)}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-container-padding-desktop py-8 bg-surface custom-scrollbar">
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="mb-8">
              <h3 className="text-3xl font-medium text-primary mb-2">
                {title === "Dashboard" ? `Welcome back, ${clinicName.split(' ')[0]}.` : title}
              </h3>
              <p className="text-on-surface-variant">{description}</p>
            </div>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
