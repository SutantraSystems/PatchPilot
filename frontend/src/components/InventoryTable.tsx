"use client";

import { useMemo, useState } from "react";
import { Search, Server, Boxes } from "lucide-react";
import { useFleetAssets } from "@/hooks/useComplianceData";
import { StatusBadge, SeverityBadge } from "@/components/StatusBadge";
import ScheduleJobPanel from "@/components/ScheduleJobPanel";
import { FleetAsset } from "@/types/compliance";

const STATUS_FILTERS = ["All", "Critical", "Behind", "Compliant"] as const;
const PLATFORM_FILTERS = ["All", "VM", "Kubernetes"] as const;

export default function InventoryTable() {
  const [statusFilter, setStatusFilter] =
    useState<(typeof STATUS_FILTERS)[number]>("All");
  const [platformFilter, setPlatformFilter] =
    useState<(typeof PLATFORM_FILTERS)[number]>("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [panelOpen, setPanelOpen] = useState(false);

  const { data: assets, isLoading, isError } = useFleetAssets(statusFilter);

  const filtered = useMemo(() => {
    if (!assets) return [];
    return assets.filter((a) => {
      if (platformFilter !== "All" && a.platform !== platformFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        if (
          !a.name.toLowerCase().includes(q) &&
          !a.engine.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [assets, platformFilter, search]);

  const selectedAssets: FleetAsset[] = useMemo(
    () => filtered.filter((a) => selected.has(a.id)),
    [filtered, selected]
  );

  const allVisibleSelected =
    filtered.length > 0 && filtered.every((a) => selected.has(a.id));

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAllVisible() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        filtered.forEach((a) => next.delete(a.id));
      } else {
        filtered.forEach((a) => next.add(a.id));
      }
      return next;
    });
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name or engine…"
              className="w-56 rounded-md border border-slate-200 py-1.5 pl-8 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <FilterGroup
              options={PLATFORM_FILTERS}
              value={platformFilter}
              onChange={setPlatformFilter}
            />
            <FilterGroup
              options={STATUS_FILTERS}
              value={statusFilter}
              onChange={setStatusFilter}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
                <th className="w-10 px-5 py-3">
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={toggleAllVisible}
                    className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                    aria-label="Select all visible targets"
                  />
                </th>
                <th className="px-5 py-3 font-medium">Asset</th>
                <th className="px-5 py-3 font-medium">Platform</th>
                <th className="px-5 py-3 font-medium">Current</th>
                <th className="px-5 py-3 font-medium">Latest</th>
                <th className="px-5 py-3 font-medium">CVEs</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading && (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-slate-300">
                    Loading inventory…
                  </td>
                </tr>
              )}
              {isError && (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-status-critical">
                    Could not load inventory.
                  </td>
                </tr>
              )}
              {filtered.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                    No targets match these filters.
                  </td>
                </tr>
              )}
              {filtered.map((asset) => (
                <tr
                  key={asset.id}
                  onClick={() => toggleOne(asset.id)}
                  className="cursor-pointer hover:bg-slate-50"
                >
                  <td className="px-5 py-3" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selected.has(asset.id)}
                      onChange={() => toggleOne(asset.id)}
                      className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                      aria-label={`Select ${asset.name}`}
                    />
                  </td>
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
                  <td className="px-5 py-3">
                    <StatusBadge status={asset.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selected.size > 0 && (
        <div className="sticky bottom-4 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-5 py-3 shadow-lg">
          <span className="text-sm font-medium text-slate-700">
            {selected.size} target{selected.size === 1 ? "" : "s"} selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelected(new Set())}
              className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-500 hover:bg-slate-100"
            >
              Clear
            </button>
            <button
              onClick={() => setPanelOpen(true)}
              className="rounded-md bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
            >
              Schedule Patch Job
            </button>
          </div>
        </div>
      )}

      {panelOpen && (
        <ScheduleJobPanel
          assets={selectedAssets}
          onClose={() => setPanelOpen(false)}
          onScheduled={() => {
            setPanelOpen(false);
            setSelected(new Set());
          }}
        />
      )}
    </div>
  );
}

function FilterGroup<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex gap-1">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={
            opt === value
              ? "rounded-md bg-brand-600 px-2.5 py-1 text-xs font-medium text-white"
              : "rounded-md px-2.5 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100"
          }
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
