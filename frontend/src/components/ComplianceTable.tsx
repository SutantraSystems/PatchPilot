"use client";

import { useState } from "react";
import { Server, Boxes } from "lucide-react";
import { useFleetAssets } from "@/hooks/useComplianceData";
import { StatusBadge, SeverityBadge } from "@/components/StatusBadge";

const STATUS_FILTERS = ["All", "Critical", "Behind", "Compliant"] as const;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function ComplianceTable() {
  const [status, setStatus] = useState<(typeof STATUS_FILTERS)[number]>("All");
  const { data: assets, isLoading, isError } = useFleetAssets(status);

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <h2 className="text-sm font-medium text-slate-700">
          Fleet compliance
        </h2>
        <div className="flex gap-1">
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
              <th className="px-5 py-3 font-medium">Asset</th>
              <th className="px-5 py-3 font-medium">Platform</th>
              <th className="px-5 py-3 font-medium">Current</th>
              <th className="px-5 py-3 font-medium">Latest</th>
              <th className="px-5 py-3 font-medium">CVEs</th>
              <th className="px-5 py-3 font-medium">Last patched</th>
              <th className="px-5 py-3 font-medium">Next window</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading && (
              <tr>
                <td colSpan={8} className="px-5 py-8 text-center text-slate-300">
                  Loading fleet data…
                </td>
              </tr>
            )}
            {isError && (
              <tr>
                <td colSpan={8} className="px-5 py-8 text-center text-status-critical">
                  Could not load fleet compliance data.
                </td>
              </tr>
            )}
            {assets?.map((asset) => (
              <tr key={asset.id} className="hover:bg-slate-50">
                <td className="px-5 py-3">
                  <div className="font-medium text-slate-900">{asset.name}</div>
                  <div className="text-xs text-slate-400">{asset.engine}</div>
                </td>
                <td className="px-5 py-3">
                  <span className="inline-flex items-center gap-1.5 text-slate-600">
                    {asset.platform === "VM" ? (
                      <Server className="h-3.5 w-3.5" />
                    ) : (
                      <Boxes className="h-3.5 w-3.5" />
                    )}
                    {asset.platform}
                  </span>
                </td>
                <td className="px-5 py-3 text-slate-600">{asset.currentVersion}</td>
                <td className="px-5 py-3 text-slate-600">{asset.latestVersion}</td>
                <td className="px-5 py-3">
                  {asset.cvesOutstanding > 0 ? (
                    <SeverityBadge severity={asset.highestSeverity} />
                  ) : (
                    <span className="text-slate-400">0</span>
                  )}
                </td>
                <td className="px-5 py-3 text-slate-600">
                  {formatDate(asset.lastPatched)}
                </td>
                <td className="px-5 py-3 text-slate-600">
                  {formatDate(asset.nextWindow)}
                </td>
                <td className="px-5 py-3">
                  <StatusBadge status={asset.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
