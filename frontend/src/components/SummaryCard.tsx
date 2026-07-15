import { LucideIcon } from "lucide-react";
import clsx from "clsx";

interface SummaryCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: "default" | "critical" | "positive";
  loading?: boolean;
}

const TONE_STYLES: Record<NonNullable<SummaryCardProps["tone"]>, string> = {
  default: "text-slate-900",
  critical: "text-status-critical",
  positive: "text-status-compliant",
};

export default function SummaryCard({
  label,
  value,
  icon: Icon,
  tone = "default",
  loading = false,
}: SummaryCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        <Icon className="h-5 w-5 text-slate-400" />
      </div>
      <div
        className={clsx(
          "mt-3 text-3xl font-semibold",
          loading ? "animate-pulse text-slate-300" : TONE_STYLES[tone]
        )}
      >
        {loading ? "—" : value}
      </div>
    </div>
  );
}
