"use client";

import { useQuery } from "@tanstack/react-query";
import { Job } from "@/types/job";
import { API_BASE_URL } from "@/lib/apiBase";

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Request to ${url} failed with status ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export function useJobs(status: string) {
  return useQuery({
    queryKey: ["jobs", status],
    queryFn: () =>
      fetchJson<Job[]>(
        `${API_BASE_URL}/api/jobs?status=${encodeURIComponent(status)}`
      ),
    // No socket on the list view — a light poll keeps status columns
    // reasonably fresh without needing a live connection per row.
    refetchInterval: 10_000,
  });
}

export function useJob(id: string) {
  return useQuery({
    queryKey: ["jobs", "detail", id],
    queryFn: () => fetchJson<Job>(`${API_BASE_URL}/api/jobs/${id}`),
    enabled: Boolean(id),
  });
}
