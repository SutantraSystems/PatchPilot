"use client";

import { useState } from "react";
import Link from "next/link";
import { Server, Boxes, ChevronRight } from "lucide-react";
import { useJobs } from "@/hooks/useJobs";
import JobStatusBadge from "@/components/JobStatusBadge";
import { JobStatus } from "@/types/job";

const STATUS_FILTERS: (JobStatus | "All")[] = [
  "All",
  "Running",
  "Validating",
  "Pending",
  "Approved",
  "Rejected",
  "Complete",
  "Failed",
  "RolledBack",
];

function formatDateTime(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function JobsTable() {
  const [status, setStatus] = useState<(typeof STATUS_FILTERS)[number]>("All");
  const { data: jobs, isLoading, isError } = useJobs(status);

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-5 py-4">
        <h2 className="text-sm font-medium text-slate-700">Patch jobs</h2>
        <div className="flex flex-wrap gap-1">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setStatus(f)}
              className={
                f === status
                  ? "rounded-md bg-brand-600 px-2.5 py-1 text-xs font-medium text-white"
                  : "rounded-md px-2.5 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100"
              }
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
              <th className="px-5 py-3 font-medium">Target</th>
              <th className="px-5 py-3 font-medium">Platform</th>
              <th className="px-5 py-3 font-medium">Version</th>
              <th className="px-5 py-3 font-medium">Progress</th>
              <th className="px-5 py-3 font-medium">Scheduled</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading && (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-slate-300">
                  Loading jobs…
                </td>
              </tr>
            )}
            {isError && (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-status-critical">
                  Could not load jobs.
                </td>
              </tr>
            )}
            {jobs?.length === 0 && !isLoading && (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                  No jobs match this filter.
                </td>
              </tr>
            )}
            {jobs?.map((job) => (
              <tr key={job.id} className="hover:bg-slate-50">
                <td className="px-5 py-3">
                  <div className="font-medium text-slate-900">{job.targetName}</div>
                  <div className="text-xs text-slate-400">{job.engine}</div>
                </td>
                <td className="px-5 py-3">
                  <span className="inline-flex items-center gap-1.5 text-slate-600">
                    {job.platform === "VM" ? (
                      <Server className="h-3.5 w-3.5" />
                    ) : (
                      <Boxes className="h-3.5 w-3.5" />
                    )}
                    {job.platform}
                  </span>
                </td>
                <td className="px-5 py-3 text-slate-600">
                  {job.fromVersion} → {job.toVersion}
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-brand-600"
                        style={{ width: `${job.progressPercent}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-400">
                      {job.progressPercent}%
                    </span>
                  </div>
                </td>
                <td className="px-5 py-3 text-slate-600">
                  {formatDateTime(job.scheduledFor)}
                </td>
                <td className="px-5 py-3">
                  <JobStatusBadge status={job.status} />
                </td>
                <td className="px-5 py-3 text-right">
                  <Link
                    href={`/jobs/${job.id}`}
                    className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700"
                  >
                    Details
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
