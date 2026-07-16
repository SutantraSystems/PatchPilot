"""
Mirrors src/types/job.ts, field-for-field and camelCase, for the same
wire-compatibility reason as models/compliance.py.
"""

from enum import Enum
from typing import List, Optional
from pydantic import BaseModel

from models.compliance import Platform


class JobStatus(str, Enum):
    """
    Mirrors the Job Orchestrator's state machine:
    pending -> approved -> running -> validating -> complete | failed -> rolledBack
    ("rejected" is the other exit out of pending, via the Approval Queue.)
    """

    PENDING = "Pending"
    APPROVED = "Approved"
    REJECTED = "Rejected"
    RUNNING = "Running"
    VALIDATING = "Validating"
    COMPLETE = "Complete"
    FAILED = "Failed"
    ROLLED_BACK = "RolledBack"


class LogLevel(str, Enum):
    INFO = "info"
    WARN = "warn"
    ERROR = "error"


class JobLogEntry(BaseModel):
    timestamp: str  # ISO datetime
    message: str
    level: LogLevel


class Job(BaseModel):
    id: str
    targetName: str
    platform: Platform
    engine: str
    fromVersion: str
    toVersion: str
    status: JobStatus
    requestedBy: str
    approvedBy: Optional[str] = None
    createdAt: str  # ISO datetime
    scheduledFor: str  # ISO datetime
    startedAt: Optional[str] = None
    completedAt: Optional[str] = None
    progressPercent: int
    currentStep: str
    logs: List[JobLogEntry]


class CreateJobRequest(BaseModel):
    assetId: str
    scheduledFor: str  # ISO datetime


class JobDecisionRequest(BaseModel):
    action: str  # "approve" | "reject"
    actor: str
    reason: Optional[str] = None


# The ordered step scripts each execution adapter walks through, used both
# by the fixture data and by the SSE simulation for currently-running jobs.
VM_ADAPTER_STEPS = [
    "Taking pre-patch snapshot",
    "Stopping database service",
    "Applying patch via package manager",
    "Restarting database service",
    "Running post-patch health check",
]

K8S_ADAPTER_STEPS = [
    "Backing up via Velero / native snapshot",
    "Updating StatefulSet image version",
    "Rolling restart: pod 1 of 3",
    "Rolling restart: pod 2 of 3",
    "Rolling restart: pod 3 of 3",
    "Verifying replication and quorum health",
]


def steps_for_platform(platform: Platform) -> List[str]:
    return VM_ADAPTER_STEPS if platform == Platform.VM else K8S_ADAPTER_STEPS
