"use client";

import { AlertTriangle, CheckCircle2, ListChecks, Server } from "lucide-react";
import SummaryCard from "@/components/SummaryCard";
import SeverityChart from "@/components/SeverityChart";
import ComplianceTable from "@/components/ComplianceTable";
import { useComplianceSummary } from "@/hooks/useComplianceData";

export default function DashboardPage() {
  const { data: summary, isLoading } = useComplianceSummary();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Compliance Overview
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Patch status across every VM- and Kubernetes-hosted database in the
          fleet.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          label="Total assets"
          value={summary ? String(summary.totalAssets) : "—"}
          icon={Server}
          loading={isLoading}
        />
        <SummaryCard
          label="Fleet compliant"
          value={summary ? `${summary.compliantPercent}%` : "—"}
          icon={CheckCircle2}
          tone="positive"
          loading={isLoading}
        />
        <SummaryCard
          label="Critical CVEs outstanding"
          value={summary ? String(summary.criticalCves) : "—"}
          icon={AlertTriangle}
          tone="critical"
          loading={isLoading}
        />
        <SummaryCard
          label="Jobs scheduled this week"
          value={summary ? String(summary.jobsScheduledThisWeek) : "—"}
          icon={ListChecks}
          loading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SeverityChart
            breakdown={summary?.severityBreakdown}
            loading={isLoading}
          />
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-medium text-slate-500">
            Assets by platform
          </h2>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Virtual machines</span>
              <span className="text-lg font-semibold text-slate-900">
                {isLoading ? "—" : summary?.platformBreakdown.vm}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Kubernetes</span>
              <span className="text-lg font-semibold text-slate-900">
                {isLoading ? "—" : summary?.platformBreakdown.kubernetes}
              </span>
            </div>
          </div>
        </div>
      </div>

      <ComplianceTable />
    </div>
  );
}
