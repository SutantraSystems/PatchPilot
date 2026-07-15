"use client";

import { useEffect, useRef, useState } from "react";
import { Job, JobLogEntry } from "@/types/job";
import { API_BASE_URL } from "@/lib/apiBase";

export interface LiveJobState {
  status: string;
  progressPercent: number;
  currentStep: string;
  logs: JobLogEntry[];
  connected: boolean;
}

interface LogEventPayload {
  logs: JobLogEntry[];
  progressPercent: number;
  currentStep: string;
  status: string;
}

/**
 * Subscribes to the /api/jobs/:id/events SSE stream and keeps a running
 * view of the job's live status. Replaces polling: the browser holds one
 * open connection and the server pushes updates as they happen — this is
 * the "WebSocket/SSE client for live job status updates" piece called out
 * for the Web UI in the architecture doc.
 */
export function useJobEvents(
  jobId: string,
  initialJob: Job | undefined
): LiveJobState | null {
  const [state, setState] = useState<LiveJobState | null>(null);
  const logsRef = useRef<JobLogEntry[]>([]);

  // Keyed on the job's id, not the whole object, so a background refetch
  // of the job (React Query returning a new object reference) doesn't
  // tear down and reopen the stream.
  useEffect(() => {
    if (!initialJob) return;

    logsRef.current = [];
    setState({
      status: initialJob.status,
      progressPercent: initialJob.progressPercent,
      currentStep: initialJob.currentStep,
      logs: [],
      connected: false,
    });

    const source = new EventSource(`${API_BASE_URL}/api/jobs/${jobId}/events`);

    source.onopen = () => {
      setState((prev) => (prev ? { ...prev, connected: true } : prev));
    };

    source.addEventListener("log", (event) => {
      const payload = JSON.parse(
        (event as MessageEvent).data
      ) as LogEventPayload;
      logsRef.current = [...logsRef.current, ...payload.logs];
      setState({
        status: payload.status,
        progressPercent: payload.progressPercent,
        currentStep: payload.currentStep,
        logs: logsRef.current,
        connected: true,
      });
    });

    source.addEventListener("done", () => {
      source.close();
      setState((prev) => (prev ? { ...prev, connected: false } : prev));
    });

    source.onerror = () => {
      source.close();
      setState((prev) => (prev ? { ...prev, connected: false } : prev));
    };

    return () => {
      source.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId, initialJob?.id]);

  return state;
}
