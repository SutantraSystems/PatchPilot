"use client";

import Link from "next/link";
import { ArrowLeft, Server, Boxes, Radio } from "lucide-react";
import { useJob } from "@/hooks/useJobs";
import { useJobEvents } from "@/hooks/useJobEvents";
import JobStatusBadge from "@/components/JobStatusBadge";
import JobLogTimeline from "@/components/JobLogTimeline";
import { JobStatus } from "@/types/job";

function formatDateTime(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function JobDetailPage({ params }: { params: { id: string } }) {
  const { data: job, isLoading, isError } = useJob(params.id);
  const live = useJobEvents(params.id, job);

  if (isLoading) {
    return <p className="text-sm text-slate-400">Loading job…</p>;
  }

  if (isError || !job) {
    return (
      <div className="space-y-4">
        <BackLink />
        <p className="text-sm text-status-critical">
          Could not load this job. It may not exist.
        </p>
      </div>
    );
  }

  const status = (live?.status as JobStatus) ?? job.status;
  const progressPercent = live?.progressPercent ?? job.progressPercent;
  const currentStep = live?.currentStep ?? job.currentStep;
  const logs = live && live.logs.length > 0 ? live.logs : job.logs;

  return (
    <div className="space-y-6">
      <BackLink />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            {job.targetName}
          </h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
            {job.platform === "VM" ? (
              <Server className="h-4 w-4" />
            ) : (
              <Boxes className="h-4 w-4" />
            )}
            {job.engine} · {job.fromVersion} → {job.toVersion}
          </p>
        </div>
        <JobStatusBadge status={status} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <InfoCard label="Requested by" value={job.requestedBy} />
        <InfoCard label="Approved by" value={job.approvedBy ?? "Awaiting approval"} />
        <InfoCard label="Scheduled for" value={formatDateTime(job.scheduledFor)} />
        <InfoCard
          label={job.completedAt ? "Completed" : "Started"}
          value={formatDateTime(job.completedAt ?? job.startedAt)}
        />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-slate-500">Live status</h2>
          {live?.connected && (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-600">
              <Radio className="h-3.5 w-3.5 animate-pulse" />
              Live
            </span>
          )}
        </div>
        <p className="mt-2 text-sm text-slate-700">{currentStep}</p>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-brand-600 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="mt-1 text-xs text-slate-400">{progressPercent}% complete</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-medium text-slate-500">Job log</h2>
        <JobLogTimeline logs={logs} />
      </div>
    </div>
  );
}

function BackLink() {
  return (
    <Link
      href="/jobs"
      className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
    >
      <ArrowLeft className="h-4 w-4" />
      Back to jobs
    </Link>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-xs font-medium text-slate-400">{label}</div>
      <div className="mt-1 text-sm font-medium text-slate-900">{value}</div>
    </div>
  );
}
