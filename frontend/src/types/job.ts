import { Platform } from "@/types/compliance";

/**
 * Mirrors the Job Orchestrator's state machine from the architecture doc:
 * pending -> approved -> running -> validating -> complete | failed -> rolledBack
 * ("Rejected" is the other exit out of Pending, via the Approval Queue.)
 */
export type JobStatus =
  | "Pending"
  | "Approved"
  | "Rejected"
  | "Running"
  | "Validating"
  | "Complete"
  | "Failed"
  | "RolledBack";

export type LogLevel = "info" | "warn" | "error";

export interface JobLogEntry {
  timestamp: string; // ISO datetime
  message: string;
  level: LogLevel;
}

export interface Job {
  id: string;
  targetName: string;
  platform: Platform;
  engine: string;
  fromVersion: string;
  toVersion: string;
  status: JobStatus;
  requestedBy: string;
  approvedBy: string | null;
  createdAt: string; // ISO datetime
  scheduledFor: string; // ISO datetime
  startedAt: string | null;
  completedAt: string | null;
  progressPercent: number;
  currentStep: string;
  logs: JobLogEntry[];
}

// The ordered step scripts each execution adapter walks through, used both
// by the fixture data and by the SSE simulation for currently-running jobs.
export const VM_ADAPTER_STEPS = [
  "Taking pre-patch snapshot",
  "Stopping database service",
  "Applying patch via package manager",
  "Restarting database service",
  "Running post-patch health check",
] as const;

export const K8S_ADAPTER_STEPS = [
  "Backing up via Velero / native snapshot",
  "Updating StatefulSet image version",
  "Rolling restart: pod 1 of 3",
  "Rolling restart: pod 2 of 3",
  "Rolling restart: pod 3 of 3",
  "Verifying replication and quorum health",
] as const;

export function stepsForPlatform(platform: Platform): readonly string[] {
  return platform === "VM" ? VM_ADAPTER_STEPS : K8S_ADAPTER_STEPS;
}

export interface CreateJobRequest {
  assetId: string;
  scheduledFor: string; // ISO datetime
}

export interface JobDecisionRequest {
  action: "approve" | "reject";
  actor: string;
  reason?: string;
}
