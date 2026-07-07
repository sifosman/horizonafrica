"use client";

import { Menu, LogOut } from "lucide-react";

interface TopBarProps {
  user: { email: string | null } | null;
  onMenuClick: () => void;
}

export function TopBar({ user, onMenuClick }: TopBarProps) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-outline bg-surface px-4 lg:px-6">
      <button
        onClick={onMenuClick}
        className="text-on-surface-variant hover:text-on-surface lg:hidden"
      >
        <Menu className="h-6 w-6" />
      </button>

      <div className="hidden lg:block">
        <h2 className="text-sm font-medium text-on-surface-variant">
          WhatsApp AI Sales Platform
        </h2>
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <span className="text-sm text-on-surface-variant">{user.email}</span>
        )}
        <form action="/auth/signout" method="POST">
          <button
            type="submit"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-on-surface-variant transition hover:bg-surface-variant hover:text-on-surface"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </form>
      </div>
    </header>
  );
}
