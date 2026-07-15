"use client";

import { useQuery } from "@tanstack/react-query";
import { ComplianceSummary, FleetAsset } from "@/types/compliance";
import { API_BASE_URL } from "@/lib/apiBase";

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Request to ${url} failed with status ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export function useComplianceSummary() {
  return useQuery({
    queryKey: ["compliance", "summary"],
    queryFn: () =>
      fetchJson<ComplianceSummary>(`${API_BASE_URL}/api/compliance/summary`),
  });
}

export function useFleetAssets(status: string) {
  return useQuery({
    queryKey: ["compliance", "fleet", status],
    queryFn: () =>
      fetchJson<FleetAsset[]>(
        `${API_BASE_URL}/api/compliance/fleet?status=${encodeURIComponent(status)}`
      ),
  });
}
