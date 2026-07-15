import clsx from "clsx";
import { JobStatus } from "@/types/job";

const STYLES: Record<JobStatus, string> = {
  Pending: "bg-slate-50 text-slate-600 ring-slate-500/20",
  Approved: "bg-blue-50 text-blue-700 ring-blue-600/20",
  Rejected: "bg-red-50 text-red-500 ring-red-500/20",
  Running: "bg-indigo-50 text-indigo-700 ring-indigo-600/20",
  Validating: "bg-indigo-50 text-indigo-700 ring-indigo-600/20",
  Complete: "bg-green-50 text-green-700 ring-green-600/20",
  Failed: "bg-red-50 text-red-700 ring-red-600/20",
  RolledBack: "bg-amber-50 text-amber-700 ring-amber-600/20",
};

const ACTIVE: JobStatus[] = ["Running", "Validating"];

export default function JobStatusBadge({ status }: { status: JobStatus }) {
  const isActive = ACTIVE.includes(status);
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        STYLES[status]
      )}
    >
      {isActive && (
        <span className="h-1.5 w-1.5 rounded-full bg-current opacity-75 animate-pulse" />
      )}
      {status}
    </span>
  );
}
