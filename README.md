## Prerequisites

Before running the project, ensure the following software is installed:

- Node.js 18.17 or later
- Python **3.12.10 (Recommended)**


> **Note:** The backend has been developed and tested with **Python 3.12.10**. Using this version is recommended to avoid dependency compatibility issues.

## Start the Frontend

Open a terminal and run:

```bash
cd frontend
npm install
npm run dev
```

Frontend URL:

```
http://localhost:3000


# Patch Pilot (FRONTEND)

First component from the architecture: the **Patch Pilot**, built as scoped —
Next.js + TypeScript + Tailwind + TanStack React Query. All four originally
scoped screens are done. The backend now lives as a separate Python
service — see `../backend` — since the domain services were
standardized on Python.

Frontend verified working with Node.js via `npm install && npm run dev`.

## What's here

**Dashboard / Compliance Overview** (`/`) — the landing page:

- KPI cards: total assets, fleet compliant %, critical CVEs outstanding, jobs scheduled this week
- Severity breakdown chart (Recharts)
- VM vs. Kubernetes asset split
- Fleet compliance table, filterable by status (All / Critical / Behind / Compliant)

**Patch Jobs** (`/jobs`) — list of every patch job, filterable by status
(Pending / Approved / Rejected / Running / Validating / Complete / Failed /
RolledBack), with target, platform, version, and a progress bar per row.

**Job detail with live status** (`/jobs/[id]`) — job metadata (requested/approved
by, scheduled/started/completed times), a live-updating status card, and a
scrolling job log. This is the WebSocket/SSE piece from the architecture doc:
the page opens a real Server-Sent Events connection
(`/api/jobs/[id]/events`, served by the Python backend) and updates the
progress bar, current step, and log timeline as events arrive — no polling.

**Inventory / target picker** (`/inventory`) — every VM- and
Kubernetes-hosted database, searchable and filterable by platform and
compliance status, with checkboxes to select one or more targets. Selecting
targets and clicking "Schedule Patch Job" opens a panel to pick a
maintenance-window start time; confirming creates a real Pending job per
target (via `POST /api/jobs`) and takes you to `/jobs`.

**Approval Queue** (`/approvals`) — every job sitting at Pending, as a
review card: target, version change, requester, and scheduled window, with
Approve and Reject actions. Approve moves the job to Approved (visible
immediately in `/jobs`); Reject opens an inline optional-reason field, then
moves it to Rejected. This is the other half of the create-a-job loop:
Inventory opens the request, Approvals decides it.

There's no login yet (that's the API Gateway's AuthN/RBAC — planned as
Keycloak with LDAP-backed group membership, not built as UI), so approvals
are attributed to a fixed placeholder identity (`priya.iyer`, set in
`src/components/ApprovalQueue.tsx`) instead of a real session user.

## Backend: now a separate Python service

This app used to include its own backend as Next.js API routes
(`src/app/api/`). Those have been removed — the backend is now
`../backend`, a FastAPI service exposing the exact same routes
(`/api/compliance/*`, `/api/jobs*`) with the exact same fixture data and
behavior, just running as its own process. See that folder's README for
what it does and how to run it.

The frontend calls it via `API_BASE_URL` in `src/lib/apiBase.ts`, which
defaults to `http://localhost:8000` — override with
`NEXT_PUBLIC_API_BASE_URL` (see `.env.local.example`) if the backend runs
somewhere else. Every hook (`useComplianceData`, `useJobs`, `useJobEvents`,
`useCreateJob`, `useJobDecision`) was updated to build its request URLs off
that constant; nothing else in the frontend changed, since both backend
implementations serve identical `FleetAsset`/`Job` JSON shapes.

**Both services need to be running for the app to work**: this Next.js
frontend on :3000, and the FastAPI backend on :8000.

## Running it

```bash
cd "frontend"
npm install
npm run dev
```

Then, in a separate terminal, start `../backend` (see its
README). Once both are up, open http://localhost:3000. Requires Node.js
18.17+.


Note: this project's `next.config.mjs` is a plain JS/ESM config, not
TypeScript — Next.js only added native `next.config.ts` support in v15, and
this project is pinned to Next 14.2.5.

## Project layout

```
frontend/
  .env.local.example                  # NEXT_PUBLIC_API_BASE_URL override
  src/
    app/
      layout.tsx                      # header, nav, React Query provider
      page.tsx                        # Dashboard / Compliance Overview
      jobs/page.tsx                   # Patch Jobs list
      jobs/[id]/page.tsx              # Job detail with live status
      inventory/page.tsx              # Inventory / target picker
      approvals/page.tsx              # Approval Queue
      globals.css
    components/
      SummaryCard.tsx / SeverityChart.tsx / ComplianceTable.tsx / StatusBadge.tsx
      JobsTable.tsx / JobStatusBadge.tsx / JobLogTimeline.tsx
      InventoryTable.tsx / ScheduleJobPanel.tsx
      ApprovalQueue.tsx
      HeaderNav.tsx                   # active-link nav (client component)
      QueryProvider.tsx
    hooks/
      useComplianceData.ts            # React Query hooks for dashboard + inventory
      useJobs.ts                      # React Query hooks for job list/detail
      useJobEvents.ts                 # SSE hook for live job status
      useCreateJob.ts                 # mutation hook for scheduling jobs
      useJobDecision.ts               # mutation hook for approve/reject
    lib/
      apiBase.ts                      # backend base URL
    types/
      compliance.ts / job.ts          # shared API contract types (also mirrored in the Python backend's Pydantic models)
```

## Not yet built

Everything from the original four-screen scope (Dashboard, Jobs,
Inventory, Approvals) is in place, now against a real Python backend.
Natural next iterations: real auth via Keycloak/LDAP (replacing the fixed
`ACTOR` placeholder and `priya.iyer`), and swapping each fixture data
module in the Python backend for the real microservice it stands in for.

## Start the Backend

Open a second terminal.

Navigate to the backend folder:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv .venv
```

Activate the virtual environment.

### Windows PowerShell

```powershell
.\.venv\Scripts\Activate.ps1
```

### Windows Command Prompt

```cmd
.venv\Scripts\activate
```

### Git Bash

```bash
source .venv/Scripts/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start the FastAPI server:

```bash
uvicorn main:app --reload --port 8000
```

Backend URL:

```
http://localhost:8000
```


Swagger API Documentation:

```
http://localhost:8000/docs
```

Health Check:

```
http://localhost:8000/health
```

# Patching Console — Backend (Python)

The Web UI's backend, converted from the original Next.js API routes to a
standalone Python (FastAPI) service, per the decision to standardize the
domain microservices on Python. This is the same temporary stand-in
backend as before — same routes, same fixture data, same behavior — just
running as its own process instead of living inside the Next.js app.

Not yet run in this sandbox: there's no npm/pip registry access here, so
this hasn't been installed or executed. On a machine with normal internet
access:


Then open http://localhost:8000/docs for the interactive OpenAPI docs
FastAPI generates automatically, or http://localhost:8000/health for a
quick liveness check. Requires Python 3.10+.

The Web UI (`../frontend`) expects this running on port 8000 by
default — see its `.env.local.example` if you need a different port or
host.

## What's here

Same four screens' worth of API as before, just re-homed:

- `GET /api/compliance/summary`, `GET /api/compliance/fleet` — dashboard and inventory data
- `GET /api/jobs`, `POST /api/jobs` — job list and job creation (from the Inventory picker)
- `GET /api/jobs/{id}`, `PATCH /api/jobs/{id}` — job detail and approve/reject (from the Approval Queue)
- `GET /api/jobs/{id}/events` — Server-Sent Events stream of live job progress

## Which fixture maps to which future service

Same mapping as before, now in Python:

- `data/fleet_data.py` stands in for the **CMDB Connector / Sync Adapter**,
  **Patch State Store**, and **Patch Catalog & OEM Repo Integration**
  services. `get_fleet_assets()` / `get_compliance_summary()` are the
  functions to redirect once those exist.
- `data/jobs_data.py` stands in for the **Job Orchestrator** and
  **Approval Workflow Service**. `get_jobs()` / `get_job_by_id()` /
  `create_job()` / `approve_job()` / `reject_job()` are the functions to
  redirect; the synthetic step-ticking in `routers/jobs.py`'s SSE endpoint
  should be replaced with a real subscription to the Event Bus.

All job/asset state lives in an in-memory Python list, so — same caveat as
before — it resets whenever the process restarts.

## Wire contract

`models/compliance.py` and `models/job.py` are Pydantic ports of the Web
UI's `src/types/compliance.ts` and `src/types/job.ts`. Field names are
intentionally camelCase (not idiomatic Python snake_case) so the JSON
matches exactly — the frontend didn't need any type changes when it
switched from calling its own Next.js routes to calling this service.

## Known gap: no real auth yet

`PATCH /api/jobs/{id}` (approve/reject) takes an `actor` field straight
from the request body — there's no session or token to pull it from yet.
Once Keycloak (with LDAP-backed group membership for who can approve) is
configured, this endpoint needs to read `actor` from the verified OIDC
token's claims server-side instead of trusting whatever the client sends,
and should check the token for an approver role/group claim before acting.

## Project layout

```
backend (Python)/
  main.py                          # FastAPI app, CORS, router registration
  requirements.txt
  models/
    compliance.py                  # Platform, Severity, FleetAsset, ComplianceSummary, ...
    job.py                         # JobStatus, Job, CreateJobRequest, JobDecisionRequest, ...
  data/
    fleet_data.py                  # fixture fleet data + summary computation
    jobs_data.py                   # fixture job data, step scripts, create/approve/reject
  routers/
    compliance.py                  # /api/compliance/*
    jobs.py                        # /api/jobs*, including the SSE stream
```
