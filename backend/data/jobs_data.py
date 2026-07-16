"""
Python port of the Web UI's src/lib/jobsData.ts, kept field-for-field
identical so both backend implementations behave the same way. Same
pattern as data/fleet_data.py: real routes and real React Query hooks sit
on top of this, all written against the `Job` contract in models/job.py.
Swap the functions below to call the actual Job Orchestrator
(Temporal/Argo Workflows) and Approval Workflow service once they exist.
"""

from datetime import datetime, timezone
from typing import List, Optional

from data.fleet_data import get_fleet_assets
from models.job import Job, JobLogEntry, JobStatus

JOBS: List[Job] = [
    Job(
        id="job-1001", targetName="ora-prod-02", platform="VM", engine="Oracle 19c",
        fromVersion="19.23.0", toVersion="19.24.0", status="Complete",
        requestedBy="manoj.rao", approvedBy="priya.iyer",
        createdAt="2026-07-09T09:12:00Z", scheduledFor="2026-07-10T02:00:00Z",
        startedAt="2026-07-10T02:00:04Z", completedAt="2026-07-10T02:14:22Z",
        progressPercent=100, currentStep="Complete",
        logs=[
            JobLogEntry(timestamp="2026-07-10T02:00:04Z", message="Job started by VM Execution Adapter", level="info"),
            JobLogEntry(timestamp="2026-07-10T02:01:10Z", message="Taking pre-patch snapshot", level="info"),
            JobLogEntry(timestamp="2026-07-10T02:03:40Z", message="Snapshot complete (EBS snapshot snap-0a1b2c3)", level="info"),
            JobLogEntry(timestamp="2026-07-10T02:03:45Z", message="Stopping database service", level="info"),
            JobLogEntry(timestamp="2026-07-10T02:05:02Z", message="Applying patch via package manager", level="info"),
            JobLogEntry(timestamp="2026-07-10T02:11:18Z", message="Restarting database service", level="info"),
            JobLogEntry(timestamp="2026-07-10T02:12:30Z", message="Running post-patch health check", level="info"),
            JobLogEntry(timestamp="2026-07-10T02:14:22Z", message="Health check passed. Job complete.", level="info"),
        ],
    ),
    Job(
        id="job-1002", targetName="pg-checkout (cnpg-cluster-01)", platform="Kubernetes",
        engine="PostgreSQL 16 (CloudNativePG)", fromVersion="16.2", toVersion="16.3", status="Running",
        requestedBy="manoj.rao", approvedBy="priya.iyer",
        createdAt="2026-07-13T11:02:00Z", scheduledFor="2026-07-14T21:00:00Z",
        startedAt="2026-07-14T21:00:06Z", completedAt=None,
        progressPercent=40, currentStep="Rolling restart: pod 2 of 3",
        logs=[
            JobLogEntry(timestamp="2026-07-14T21:00:06Z", message="Job started by K8s Execution Adapter", level="info"),
            JobLogEntry(timestamp="2026-07-14T21:00:07Z", message="Reconciling DatabasePatch custom resource", level="info"),
            JobLogEntry(timestamp="2026-07-14T21:01:30Z", message="Backing up via Velero / native snapshot", level="info"),
            JobLogEntry(timestamp="2026-07-14T21:03:12Z", message="Backup complete", level="info"),
            JobLogEntry(timestamp="2026-07-14T21:03:15Z", message="Updating StatefulSet image version", level="info"),
            JobLogEntry(timestamp="2026-07-14T21:04:40Z", message="Rolling restart: pod 1 of 3 — ready", level="info"),
            JobLogEntry(timestamp="2026-07-14T21:05:50Z", message="Rolling restart: pod 2 of 3 — in progress", level="info"),
        ],
    ),
    Job(
        id="job-1003", targetName="mssql-fin-01", platform="VM", engine="SQL Server 2022",
        fromVersion="CU12", toVersion="CU14", status="Failed",
        requestedBy="sara.kim", approvedBy="priya.iyer",
        createdAt="2026-07-08T08:40:00Z", scheduledFor="2026-07-09T01:00:00Z",
        startedAt="2026-07-09T01:00:03Z", completedAt="2026-07-09T01:09:47Z",
        progressPercent=45, currentStep="Failed during patch installation",
        logs=[
            JobLogEntry(timestamp="2026-07-09T01:00:03Z", message="Job started by VM Execution Adapter", level="info"),
            JobLogEntry(timestamp="2026-07-09T01:01:05Z", message="Taking pre-patch snapshot", level="info"),
            JobLogEntry(timestamp="2026-07-09T01:03:20Z", message="Snapshot complete (Azure Backup vault-fin-01)", level="info"),
            JobLogEntry(timestamp="2026-07-09T01:03:25Z", message="Stopping database service", level="info"),
            JobLogEntry(timestamp="2026-07-09T01:04:50Z", message="Applying patch via CU14 installer", level="info"),
            JobLogEntry(timestamp="2026-07-09T01:09:12Z", message="CU14 installer exited with code 1603", level="error"),
            JobLogEntry(timestamp="2026-07-09T01:09:47Z", message="Job marked Failed. Snapshot retained for manual rollback.", level="error"),
        ],
    ),
    Job(
        id="job-1004", targetName="mongo-catalog (percona-psmdb-01)", platform="Kubernetes",
        engine="MongoDB 7.0 (Percona Operator)", fromVersion="7.0.11", toVersion="7.0.14", status="Pending",
        requestedBy="sara.kim", approvedBy=None,
        createdAt="2026-07-14T10:15:00Z", scheduledFor="2026-07-19T21:00:00Z",
        startedAt=None, completedAt=None,
        progressPercent=0, currentStep="Awaiting approval",
        logs=[
            JobLogEntry(timestamp="2026-07-14T10:15:00Z", message="Change request submitted to Approval Workflow", level="info"),
        ],
    ),
    Job(
        id="job-1005", targetName="ora-prod-01", platform="VM", engine="Oracle 19c",
        fromVersion="19.21.0", toVersion="19.24.0", status="Approved",
        requestedBy="manoj.rao", approvedBy="priya.iyer",
        createdAt="2026-07-12T14:00:00Z", scheduledFor="2026-07-19T02:00:00Z",
        startedAt=None, completedAt=None,
        progressPercent=0, currentStep="Scheduled, awaiting maintenance window",
        logs=[
            JobLogEntry(timestamp="2026-07-12T14:00:00Z", message="Change request submitted to Approval Workflow", level="info"),
            JobLogEntry(timestamp="2026-07-12T16:30:00Z", message="Approved by priya.iyer", level="info"),
            JobLogEntry(timestamp="2026-07-12T16:30:05Z", message="Scheduled for maintenance window 2026-07-19 02:00 UTC", level="info"),
        ],
    ),
    Job(
        id="job-1006", targetName="pg-sessions (zalando-pg-01)", platform="Kubernetes",
        engine="PostgreSQL 15 (Zalando Operator)", fromVersion="15.7", toVersion="15.8", status="Validating",
        requestedBy="sara.kim", approvedBy="priya.iyer",
        createdAt="2026-07-13T09:00:00Z", scheduledFor="2026-07-14T20:00:00Z",
        startedAt="2026-07-14T20:00:05Z", completedAt=None,
        progressPercent=90, currentStep="Verifying replication and quorum health",
        logs=[
            JobLogEntry(timestamp="2026-07-14T20:00:05Z", message="Job started by K8s Execution Adapter", level="info"),
            JobLogEntry(timestamp="2026-07-14T20:01:40Z", message="Backing up via Velero / native snapshot", level="info"),
            JobLogEntry(timestamp="2026-07-14T20:03:00Z", message="Updating StatefulSet image version", level="info"),
            JobLogEntry(timestamp="2026-07-14T20:04:15Z", message="Rolling restart: pod 1 of 3 — ready", level="info"),
            JobLogEntry(timestamp="2026-07-14T20:05:30Z", message="Rolling restart: pod 2 of 3 — ready", level="info"),
            JobLogEntry(timestamp="2026-07-14T20:06:45Z", message="Rolling restart: pod 3 of 3 — ready", level="info"),
            JobLogEntry(timestamp="2026-07-14T20:07:00Z", message="Verifying replication and quorum health", level="info"),
        ],
    ),
    Job(
        id="job-1007", targetName="mysql-inventory (percona-xtradb-01)", platform="Kubernetes",
        engine="MySQL 8.0 (Percona Operator)", fromVersion="8.0.35", toVersion="8.0.37", status="RolledBack",
        requestedBy="manoj.rao", approvedBy="priya.iyer",
        createdAt="2026-07-06T09:00:00Z", scheduledFor="2026-07-07T21:00:00Z",
        startedAt="2026-07-07T21:00:04Z", completedAt="2026-07-07T21:12:51Z",
        progressPercent=60, currentStep="Rolled back after failed readiness check",
        logs=[
            JobLogEntry(timestamp="2026-07-07T21:00:04Z", message="Job started by K8s Execution Adapter", level="info"),
            JobLogEntry(timestamp="2026-07-07T21:01:20Z", message="Backing up via Velero / native snapshot", level="info"),
            JobLogEntry(timestamp="2026-07-07T21:02:50Z", message="Updating StatefulSet image version", level="info"),
            JobLogEntry(timestamp="2026-07-07T21:04:10Z", message="Rolling restart: pod 1 of 3 — ready", level="info"),
            JobLogEntry(timestamp="2026-07-07T21:06:00Z", message="Rolling restart: pod 2 of 3 — readiness probe failing", level="warn"),
            JobLogEntry(timestamp="2026-07-07T21:09:30Z", message="Readiness probe failed after 3 retries", level="error"),
            JobLogEntry(timestamp="2026-07-07T21:09:35Z", message="Auto-rollback triggered: reverting StatefulSet image", level="warn"),
            JobLogEntry(timestamp="2026-07-07T21:12:51Z", message="Rollback complete. Cluster restored to 8.0.35.", level="info"),
        ],
    ),
    Job(
        id="job-1008", targetName="pg-analytics (cnpg-cluster-02)", platform="Kubernetes",
        engine="PostgreSQL 16 (CloudNativePG)", fromVersion="16.2", toVersion="16.3", status="Complete",
        requestedBy="sara.kim", approvedBy="priya.iyer",
        createdAt="2026-07-04T09:00:00Z", scheduledFor="2026-07-05T21:00:00Z",
        startedAt="2026-07-05T21:00:05Z", completedAt="2026-07-05T21:11:40Z",
        progressPercent=100, currentStep="Complete",
        logs=[
            JobLogEntry(timestamp="2026-07-05T21:00:05Z", message="Job started by K8s Execution Adapter", level="info"),
            JobLogEntry(timestamp="2026-07-05T21:01:30Z", message="Backing up via Velero / native snapshot", level="info"),
            JobLogEntry(timestamp="2026-07-05T21:03:00Z", message="Updating StatefulSet image version", level="info"),
            JobLogEntry(timestamp="2026-07-05T21:04:20Z", message="Rolling restart: pod 1 of 3 — ready", level="info"),
            JobLogEntry(timestamp="2026-07-05T21:05:40Z", message="Rolling restart: pod 2 of 3 — ready", level="info"),
            JobLogEntry(timestamp="2026-07-05T21:07:00Z", message="Rolling restart: pod 3 of 3 — ready", level="info"),
            JobLogEntry(timestamp="2026-07-05T21:08:10Z", message="Verifying replication and quorum health", level="info"),
            JobLogEntry(timestamp="2026-07-05T21:11:40Z", message="Quorum healthy. Job complete.", level="info"),
        ],
    ),
    Job(
        id="job-1009", targetName="ora-dr-01", platform="VM", engine="Oracle 19c",
        fromVersion="19.23.0", toVersion="19.24.0", status="Running",
        requestedBy="manoj.rao", approvedBy="priya.iyer",
        createdAt="2026-07-14T08:00:00Z", scheduledFor="2026-07-14T22:00:00Z",
        startedAt="2026-07-14T22:00:03Z", completedAt=None,
        progressPercent=20, currentStep="Stopping database service",
        logs=[
            JobLogEntry(timestamp="2026-07-14T22:00:03Z", message="Job started by VM Execution Adapter", level="info"),
            JobLogEntry(timestamp="2026-07-14T22:01:00Z", message="Taking pre-patch snapshot", level="info"),
            JobLogEntry(timestamp="2026-07-14T22:03:15Z", message="Snapshot complete (EBS snapshot snap-9f8e7d6)", level="info"),
            JobLogEntry(timestamp="2026-07-14T22:03:20Z", message="Stopping database service", level="info"),
        ],
    ),
]


def get_jobs(status: Optional[str] = None) -> List[Job]:
    if not status or status == "All":
        return JOBS
    return [j for j in JOBS if j.status.value.lower() == status.lower()]


def get_job_by_id(job_id: str) -> Optional[Job]:
    return next((j for j in JOBS if j.id == job_id), None)


ACTIVE_STATUSES = {JobStatus.RUNNING, JobStatus.VALIDATING}


def is_active(status: JobStatus) -> bool:
    return status in ACTIVE_STATUSES


# Fixed-format ids (job-1001..job-1009) are the seed data above; new jobs
# created through the Inventory picker continue the sequence from here.
_next_job_id_num = 1010


def create_job(asset_id: str, scheduled_for: str) -> Optional[Job]:
    """
    Creates a new Pending job for one inventory target, mirroring what the
    Approval Workflow service would do on receiving a change request: looks
    up the asset (today via data/fleet_data.py, eventually the CMDB
    Connector + Patch State Store), and opens a job targeting its latest
    available patch version. Returns None if the asset id doesn't exist.
    """
    global _next_job_id_num

    asset = next((a for a in get_fleet_assets() if a.id == asset_id), None)
    if asset is None:
        return None

    now = datetime.now(timezone.utc).isoformat()
    job = Job(
        id=f"job-{_next_job_id_num}",
        targetName=asset.name,
        platform=asset.platform,
        engine=asset.engine,
        fromVersion=asset.currentVersion,
        toVersion=asset.latestVersion,
        status=JobStatus.PENDING,
        requestedBy="you",
        approvedBy=None,
        createdAt=now,
        scheduledFor=scheduled_for,
        startedAt=None,
        completedAt=None,
        progressPercent=0,
        currentStep="Awaiting approval",
        logs=[
            JobLogEntry(
                timestamp=now,
                message="Change request submitted to Approval Workflow",
                level="info",
            )
        ],
    )
    _next_job_id_num += 1
    JOBS.insert(0, job)
    return job


def approve_job(job_id: str, actor: str) -> Optional[Job]:
    """
    Approves a Pending job: moves it to Approved and schedules it against
    the maintenance window it was requested for. Returns None if the job
    doesn't exist or isn't awaiting approval.
    """
    job = get_job_by_id(job_id)
    if job is None or job.status != JobStatus.PENDING:
        return None

    now = datetime.now(timezone.utc).isoformat()
    job.status = JobStatus.APPROVED
    job.approvedBy = actor
    job.currentStep = "Scheduled, awaiting maintenance window"
    job.logs = job.logs + [
        JobLogEntry(timestamp=now, message=f"Approved by {actor}", level="info"),
        JobLogEntry(
            timestamp=now,
            message=f"Scheduled for maintenance window {job.scheduledFor}",
            level="info",
        ),
    ]
    return job


def reject_job(job_id: str, actor: str, reason: Optional[str] = None) -> Optional[Job]:
    """Rejects a Pending job. Returns None if not found or not Pending."""
    job = get_job_by_id(job_id)
    if job is None or job.status != JobStatus.PENDING:
        return None

    now = datetime.now(timezone.utc).isoformat()
    job.status = JobStatus.REJECTED
    job.currentStep = "Rejected"
    job.completedAt = now
    message = f"Rejected by {actor}: {reason}" if reason else f"Rejected by {actor}"
    job.logs = job.logs + [JobLogEntry(timestamp=now, message=message, level="warn")]
    return job
