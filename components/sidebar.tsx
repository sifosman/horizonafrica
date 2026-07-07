"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, MessageSquare, Radio, Settings, X, Plus, HelpCircle, LogOut } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/leads", label: "Leads", icon: Users },
  { href: "/conversations", label: "Conversations", icon: MessageSquare },
  { href: "/broadcasts", label: "Broadcasts", icon: Radio },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-[260px] transform border-r border-outline-variant bg-inverse-surface transition-transform duration-200 lg:static lg:translate-x-0 flex flex-col py-6 px-4 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="mb-6 flex items-center gap-3 px-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-container text-sm font-bold text-white shrink-0">
            HA
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight text-primary-fixed">Horizon Africa</h1>
            <p className="text-[11px] text-surface-variant opacity-80">Enterprise Sales</p>
          </div>
          <button
            onClick={onClose}
            className="ml-auto text-surface-variant hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* New Broadcast CTA */}
        <div className="mb-6 px-2">
          <Link
            href="/broadcasts"
            onClick={onClose}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-container py-3 text-xs font-semibold text-on-primary-container transition-all hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            New Broadcast
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-surface-container-highest text-on-surface"
                    : "text-surface-variant hover:bg-surface-container-highest hover:text-white"
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer Links */}
        <div className="mt-auto flex flex-col gap-1 border-t border-outline-variant/30 pt-4">
          <Link
            href="#"
            className="flex items-center gap-3 rounded-lg px-4 py-3 text-xs font-semibold text-surface-variant transition-all hover:bg-surface-container-highest hover:text-white"
          >
            <HelpCircle className="h-5 w-5" />
            Help Center
          </Link>
          <form action="/auth/signout" method="POST">
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-xs font-semibold text-surface-variant transition-all hover:bg-surface-container-highest hover:text-white"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
