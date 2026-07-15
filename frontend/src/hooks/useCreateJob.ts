"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateJobRequest, Job } from "@/types/job";
import { API_BASE_URL } from "@/lib/apiBase";

async function postJob(payload: CreateJobRequest): Promise<Job> {
  const res = await fetch(`${API_BASE_URL}/api/jobs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    // FastAPI's HTTPException serializes as { "detail": "..." }.
    throw new Error(body?.detail ?? `Request failed with status ${res.status}`);
  }
  return res.json() as Promise<Job>;
}

export function useCreateJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postJob,
    onSuccess: () => {
      // The jobs list and any job-detail queries should reflect the newly
      // created Pending job(s) immediately.
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
}
