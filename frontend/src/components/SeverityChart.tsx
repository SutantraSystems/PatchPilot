"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { SeverityBreakdown } from "@/types/compliance";

const SEVERITY_COLORS: Record<keyof SeverityBreakdown, string> = {
  critical: "#dc2626",
  high: "#f97316",
  medium: "#eab308",
  low: "#22c55e",
};

interface SeverityChartProps {
  breakdown: SeverityBreakdown | undefined;
  loading?: boolean;
}

export default function SeverityChart({
  breakdown,
  loading,
}: SeverityChartProps) {
  const data = [
    { name: "Critical", key: "critical", count: breakdown?.critical ?? 0 },
    { name: "High", key: "high", count: breakdown?.high ?? 0 },
    { name: "Medium", key: "medium", count: breakdown?.medium ?? 0 },
    { name: "Low", key: "low", count: breakdown?.low ?? 0 },
  ];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-medium text-slate-500">
        Outstanding CVEs by severity
      </h2>
      <div className="mt-4 h-64">
        {loading ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-300">
            Loading…
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748b" }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#64748b" }} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
                cursor={{ fill: "#f1f5f9" }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {data.map((entry) => (
                  <Cell
                    key={entry.key}
                    fill={SEVERITY_COLORS[entry.key as keyof SeverityBreakdown]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
