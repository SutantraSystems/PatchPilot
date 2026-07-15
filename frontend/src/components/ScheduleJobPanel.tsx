"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Server, Boxes } from "lucide-react";
import { useCreateJob } from "@/hooks/useCreateJob";
import { FleetAsset } from "@/types/compliance";

function defaultScheduledFor(): string {
  const d = new Date();
  d.setDate(d.getDate() + 2);
  d.setHours(2, 0, 0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

interface ScheduleJobPanelProps {
  assets: FleetAsset[];
  onClose: () => void;
  onScheduled: () => void;
}

export default function ScheduleJobPanel({
  assets,
  onClose,
  onScheduled,
}: ScheduleJobPanelProps) {
  const [scheduledFor, setScheduledFor] = useState(defaultScheduledFor());
  const [error, setError] = useState<string | null>(null);
  const createJob = useCreateJob();
  const router = useRouter();

  async function handleConfirm() {
    setError(null);
    const iso = new Date(scheduledFor).toISOString();
    try {
      await Promise.all(
        assets.map((asset) =>
          createJob.mutateAsync({ assetId: asset.id, scheduledFor: iso })
        )
      );
      onScheduled();
      router.push("/jobs");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to schedule job(s).");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="text-sm font-semibold text-slate-900">
            Schedule patch job{assets.length === 1 ? "" : "s"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-64 space-y-2 overflow-y-auto px-5 py-4">
          {assets.map((asset) => (
            <div
              key={asset.id}
              className="flex items-center justify-between rounded-md border border-slate-100 px-3 py-2 text-sm"
            >
              <div className="flex items-center gap-2">
                {asset.platform === "VM" ? (
                  <Server className="h-3.5 w-3.5 text-slate-400" />
                ) : (
                  <Boxes className="h-3.5 w-3.5 text-slate-400" />
                )}
                <span className="font-medium text-slate-800">{asset.name}</span>
              </div>
              <span className="text-xs text-slate-400">
                {asset.currentVersion} → {asset.latestVersion}
              </span>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-200 px-5 py-4">
          <label className="block text-xs font-medium text-slate-500">
            Maintenance window start
          </label>
          <input
            type="datetime-local"
            value={scheduledFor}
            onChange={(e) => setScheduledFor(e.target.value)}
            className="mt-1.5 w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-700 focus:border-brand-500 focus:outline-none"
          />
          <p className="mt-1.5 text-xs text-slate-400">
            Creates a Pending job per target, submitted to the Approval
            Workflow.
          </p>
          {error && (
            <p className="mt-2 text-xs text-status-critical">{error}</p>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-4">
          <button
            onClick={onClose}
            className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-500 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={createJob.isPending}
            className="rounded-md bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {createJob.isPending ? "Scheduling…" : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}
