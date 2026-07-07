import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: string;
}

export function StatCard({ label, value, icon: Icon, accent = "text-primary-600" }: StatCardProps) {
  return (
    <div className="rounded-xl border border-outline bg-surface p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-on-surface-variant">{label}</p>
          <p className="mt-1 text-2xl font-bold text-on-surface">{value}</p>
        </div>
        <div className={`rounded-lg bg-primary-50 p-3 ${accent}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}
