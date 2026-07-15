"use client";

import { useState } from "react";
import { Server, Boxes, Check, X as XIcon } from "lucide-react";
import { useJobs } from "@/hooks/useJobs";
import { useJobDecision } from "@/hooks/useJobDecision";

// Stand-in for the logged-in approver until the API Gateway's AuthN/RBAC
// exists and a real session identity is available.
const ACTOR = "priya.iyer";

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function ApprovalQueue() {
  const { data: jobs, isLoading, isError } = useJobs("Pending");
  const decision = useJobDecision();
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  function approve(id: string) {
    decision.mutate({ id, payload: { action: "approve", actor: ACTOR } });
  }

  function confirmReject(id: string) {
    decision.mutate({
      id,
      payload: { action: "reject", actor: ACTOR, reason: reason.trim() || undefined },
    });
    setRejectingId(null);
    setReason("");
  }

  if (isLoading) {
    return <p className="text-sm text-slate-400">Loading approval queue…</p>;
  }

  if (isError) {
    return (
      <p className="text-sm text-status-critical">
        Could not load the approval queue.
      </p>
    );
  }

  if (!jobs || jobs.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-400">
        Nothing waiting on approval.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {jobs.map((job) => (
        <div
          key={job.id}
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                {job.platform === "VM" ? (
                  <Server className="h-4 w-4 text-slate-400" />
                ) : (
                  <Boxes className="h-4 w-4 text-slate-400" />
                )}
                <span className="font-medium text-slate-900">
                  {job.targetName}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-400">
                {job.engine} · {job.fromVersion} → {job.toVersion}
              </p>
              <p className="mt-2 text-sm text-slate-600">
                Requested by{" "}
                <span className="font-medium text-slate-800">
                  {job.requestedBy}
                </span>{" "}
                · scheduled for {formatDateTime(job.scheduledFor)}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  setRejectingId(rejectingId === job.id ? null : job.id)
                }
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                <XIcon className="h-3.5 w-3.5" />
                Reject
              </button>
              <button
                onClick={() => approve(job.id)}
                disabled={decision.isPending}
                className="inline-flex items-center gap-1.5 rounded-md bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
              >
                <Check className="h-3.5 w-3.5" />
                Approve
              </button>
            </div>
          </div>

          {rejectingId === job.id && (
            <div className="mt-4 border-t border-slate-100 pt-4">
              <label className="block text-xs font-medium text-slate-500">
                Reason (optional)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
                placeholder="Why is this being rejected?"
                className="mt-1.5 w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-700 focus:border-brand-500 focus:outline-none"
              />
              <div className="mt-2 flex justify-end gap-2">
                <button
                  onClick={() => {
                    setRejectingId(null);
                    setReason("");
                  }}
                  className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-500 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  onClick={() => confirmReject(job.id)}
                  disabled={decision.isPending}
                  className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                >
                  Confirm reject
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
