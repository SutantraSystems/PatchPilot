import asyncio
import json
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse

from data.jobs_data import approve_job, create_job, get_job_by_id, get_jobs, reject_job
from models.job import CreateJobRequest, Job, JobDecisionRequest, JobStatus, steps_for_platform

router = APIRouter(prefix="/api/jobs", tags=["jobs"])

TICK_SECONDS = 1.8


@router.get("", response_model=List[Job])
def list_jobs(status: Optional[str] = None) -> List[Job]:
    """Lists patch jobs, optionally filtered by status."""
    return get_jobs(status)


@router.post("", response_model=Job, status_code=201)
def create(payload: CreateJobRequest) -> Job:
    """
    Opens a new job for one inventory target, at Pending status, exactly as
    the Approval Workflow service would on receiving a change request. Used
    by the Inventory / target picker screen.
    """
    job = create_job(payload.assetId, payload.scheduledFor)
    if job is None:
        raise HTTPException(status_code=404, detail="Asset not found")
    return job


@router.get("/{job_id}", response_model=Job)
def detail(job_id: str) -> Job:
    """Single job's full detail, including its log history."""
    job = get_job_by_id(job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@router.patch("/{job_id}", response_model=Job)
def decide(job_id: str, payload: JobDecisionRequest) -> Job:
    """
    The Approval Queue's decision endpoint. Stands in for the Approval
    Workflow service: moves a Pending job to Approved or Rejected. There's
    no auth yet (that's the API Gateway's AuthN/RBAC, not built here), so
    the caller passes `actor` directly rather than it coming from a
    verified session/token.
    """
    if payload.action == "approve":
        job = approve_job(job_id, payload.actor)
    elif payload.action == "reject":
        job = reject_job(job_id, payload.actor, payload.reason)
    else:
        raise HTTPException(status_code=400, detail="action must be 'approve' or 'reject'")

    if job is None:
        raise HTTPException(
            status_code=404, detail="Job not found or not awaiting approval"
        )
    return job


def _sse(event: str, data: dict) -> str:
    return f"event: {event}\ndata: {json.dumps(data)}\n\n"


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


@router.get("/{job_id}/events")
async def events(job_id: str, request: Request) -> StreamingResponse:
    """
    Server-Sent Events stream of live job progress.

    This is the real-time piece from the architecture doc: "both adapters
    stream progress and log events back through the Event Bus; the Job
    Status service updates state, and the Web UI reflects live status via
    WebSocket/SSE." There's no Event Bus or Job Orchestrator yet, so this
    endpoint simulates that stream — it replays the job's real log history
    immediately, then, for jobs still Running/Validating, synthesizes the
    remaining steps for that platform's execution adapter
    (VM_ADAPTER_STEPS / K8S_ADAPTER_STEPS in models/job.py) on a fixed
    interval until the job reaches Complete. The event shape (`log` /
    `done`) and transport (text/event-stream over a real HTTP connection)
    are what a real backend would send; only the source of the events is
    temporary.
    """
    job = get_job_by_id(job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found")

    steps = steps_for_platform(job.platform)
    try:
        current_index = steps.index(job.currentStep)
    except ValueError:
        current_index = -1
    remaining_steps = steps[current_index + 1 :] if current_index >= 0 else []
    job_is_active = job.status in (JobStatus.RUNNING, JobStatus.VALIDATING)

    async def event_stream():
        # Replay history immediately so a client connecting mid-job has
        # full context, not just whatever happens next.
        yield _sse(
            "log",
            {
                "logs": [log.model_dump() for log in job.logs],
                "progressPercent": job.progressPercent,
                "currentStep": job.currentStep,
                "status": job.status.value,
            },
        )

        if not job_is_active or not remaining_steps:
            if job_is_active:
                yield _sse(
                    "log",
                    {
                        "logs": [
                            {
                                "timestamp": _now_iso(),
                                "message": "Job complete.",
                                "level": "info",
                            }
                        ],
                        "progressPercent": 100,
                        "currentStep": "Complete",
                        "status": "Complete",
                    },
                )
            yield _sse("done", {"status": "Complete" if job_is_active else job.status.value})
            return

        start_progress = job.progressPercent
        total = len(remaining_steps)

        for i, step in enumerate(remaining_steps, start=1):
            if await request.is_disconnected():
                return

            await asyncio.sleep(TICK_SECONDS)

            progress_percent = round(start_progress + (i / total) * (100 - start_progress))
            is_last_step = i == total

            yield _sse(
                "log",
                {
                    "logs": [
                        {"timestamp": _now_iso(), "message": step, "level": "info"}
                    ],
                    "progressPercent": progress_percent,
                    "currentStep": "Complete" if is_last_step else step,
                    "status": "Complete" if is_last_step else job.status.value,
                },
            )

            if is_last_step:
                yield _sse("done", {"status": "Complete"})

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache, no-transform",
            "Connection": "keep-alive",
        },
    )
