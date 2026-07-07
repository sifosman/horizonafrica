import { LeadScore } from "@/lib/types";

const styles: Record<LeadScore, string> = {
  HOT: "bg-red-100 text-red-700 border-red-200",
  WARM: "bg-amber-100 text-amber-700 border-amber-200",
  COLD: "bg-blue-100 text-blue-700 border-blue-200",
};

export function ScoreBadge({ score }: { score: LeadScore }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[score]}`}
    >
      {score}
    </span>
  );
}
