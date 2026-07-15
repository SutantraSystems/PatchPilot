"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Job, JobDecisionRequest } from "@/types/job";
import { API_BASE_URL } from "@/lib/apiBase";

async function patchJob(id: string, payload: JobDecisionRequest): Promise<Job> {
  const res = await fetch(`${API_BASE_URL}/api/jobs/${id}`, {
    method: "PATCH",
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

export function useJobDecision() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: JobDecisionRequest }) =>
      patchJob(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
}
