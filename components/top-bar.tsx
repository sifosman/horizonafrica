"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Menu, Bell, HelpCircle, X, Flame, UserPlus, AlertTriangle, Clock } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

interface Notification {
  id: string;
  type: "hot_lead" | "new_lead" | "escalation" | "follow_up_due";
  title: string;
  description: string;
  leadId: number;
  timestamp: string;
}

interface TopBarProps {
  user: { email: string | null } | null;
  onMenuClick: () => void;
}

const pageTitles: Record<string, string> = {
  "/dashboard": "Overview",
  "/leads": "Leads",
  "/conversations": "Conversations",
  "/broadcasts": "Broadcasts",
  "/settings": "Settings",
};

const notifStyles: Record<Notification["type"], { icon: typeof Flame; color: string; bg: string }> = {
  hot_lead: { icon: Flame, color: "text-red-600", bg: "bg-red-50" },
  new_lead: { icon: UserPlus, color: "text-blue-600", bg: "bg-blue-50" },
  escalation: { icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50" },
  follow_up_due: { icon: Clock, color: "text-purple-600", bg: "bg-purple-50" },
};

function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function TopBar({ user, onMenuClick }: TopBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const title = pageTitles[pathname] ?? "Overview";
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastSeen, setLastSeen] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    return Number(sessionStorage.getItem("notif-last-seen") ?? 0);
  });
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications ?? []);
      }
    } catch {
      // silent fail
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => new Date(n.timestamp).getTime() > lastSeen).length;

  function toggleNotif() {
    const opening = !notifOpen;
    setNotifOpen(opening);
    if (opening) {
      const now = Date.now();
      setLastSeen(now);
      if (typeof window !== "undefined") sessionStorage.setItem("notif-last-seen", String(now));
      fetchNotifications();
    }
  }

  function goToLead(leadId: number) {
    setNotifOpen(false);
    router.push("/leads");
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-outline-variant/20 bg-surface px-8">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="text-on-surface-variant hover:text-on-surface lg:hidden"
        >
          <Menu className="h-6 w-6" />
        </button>
        <h2 className="hidden text-xl font-semibold text-on-surface md:block">{title}</h2>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={toggleNotif}
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-on-surface-variant transition-all hover:bg-surface-container-low hover:text-secondary"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-error px-1 text-[10px] font-bold text-on-error">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-xl">
              <div className="flex items-center justify-between border-b border-outline-variant px-4 py-3">
                <h3 className="text-sm font-semibold text-on-surface">Notifications</h3>
                <div className="flex items-center gap-2">
                  {notifications.length > 0 && (
                    <span className="text-xs font-medium text-on-surface-variant">
                      {notifications.length} {notifications.length === 1 ? "item" : "items"}
                    </span>
                  )}
                  <button onClick={() => setNotifOpen(false)} className="text-on-surface-variant hover:text-on-surface">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-outline-variant border-t-secondary" />
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="py-8 text-center">
                    <Bell className="mx-auto mb-2 h-8 w-8 text-on-surface-variant/30" />
                    <p className="text-sm text-on-surface-variant">No notifications</p>
                    <p className="mt-0.5 text-xs text-on-surface-variant/60">You&apos;re all caught up</p>
                  </div>
                ) : (
                  notifications.map((n) => {
                    const style = notifStyles[n.type];
    const Icon = style.icon;
    const isNew = new Date(n.timestamp).getTime() > lastSeen;
                    return (
                      <button
                        key={n.id}
                        onClick={() => goToLead(n.leadId)}
                        className="flex w-full items-start gap-3 border-b border-outline-variant/30 px-4 py-3 text-left transition hover:bg-surface-container-low last:border-0"
                      >
                        <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${style.bg}`}>
                          <Icon className={`h-4 w-4 ${style.color}`} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-sm font-semibold text-on-surface">{n.title}</p>
                            {isNew && <span className="h-2 w-2 shrink-0 rounded-full bg-error" />}
                          </div>
                          <p className="truncate text-xs text-on-surface-variant">{n.description}</p>
                          <p className="mt-0.5 text-[11px] text-on-surface-variant/60">{timeAgo(n.timestamp)}</p>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              {notifications.length > 0 && (
                <button
                  onClick={() => { setNotifOpen(false); router.push("/leads"); }}
                  className="block w-full border-t border-outline-variant py-2.5 text-center text-xs font-semibold text-secondary transition hover:bg-surface-container-low"
                >
                  View all leads
                </button>
              )}
            </div>
          )}
        </div>

        <button className="flex h-9 w-9 items-center justify-center rounded-full text-on-surface-variant transition-all hover:bg-surface-container-low hover:text-secondary">
          <HelpCircle className="h-5 w-5" />
        </button>
        <div className="mx-2 h-6 w-px bg-outline-variant/50" />
        <form action="/auth/signout" method="POST">
          <button
            type="submit"
            className="text-xs font-semibold text-on-surface transition-colors hover:text-secondary"
          >
            Sign Out
          </button>
        </form>
        <div className="ml-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-outline-variant bg-surface-container-high text-xs font-bold text-secondary">
          {user?.email?.charAt(0).toUpperCase() ?? "U"}
        </div>
      </div>
    </header>
  );
}
