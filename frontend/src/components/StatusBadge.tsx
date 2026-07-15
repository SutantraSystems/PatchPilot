import clsx from "clsx";
import { ComplianceStatus, Severity } from "@/types/compliance";

const STATUS_STYLES: Record<ComplianceStatus, string> = {
  Compliant: "bg-green-50 text-green-700 ring-green-600/20",
  Behind: "bg-amber-50 text-amber-700 ring-amber-600/20",
  Critical: "bg-red-50 text-red-700 ring-red-600/20",
};

const SEVERITY_STYLES: Record<Severity, string> = {
  Critical: "bg-red-50 text-red-700 ring-red-600/20",
  High: "bg-orange-50 text-orange-700 ring-orange-600/20",
  Medium: "bg-amber-50 text-amber-700 ring-amber-600/20",
  Low: "bg-green-50 text-green-700 ring-green-600/20",
  None: "bg-slate-50 text-slate-500 ring-slate-500/20",
};

function Badge({ label, className }: { label: string; className: string }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        className
      )}
    >
      {label}
    </span>
  );
}

export function StatusBadge({ status }: { status: ComplianceStatus }) {
  return <Badge label={status} className={STATUS_STYLES[status]} />;
}

export function SeverityBadge({ severity }: { severity: Severity }) {
  if (severity === "None") return <Badge label="None" className={SEVERITY_STYLES.None} />;
  return <Badge label={severity} className={SEVERITY_STYLES[severity]} />;
}
