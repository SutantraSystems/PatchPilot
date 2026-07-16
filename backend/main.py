from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import compliance, jobs

app = FastAPI(
    title="Patching Console API",
    description=(
        "Temporary Python backend for the Patching Console Web UI. "
        "Stands in for the CMDB Connector, Patch State Store, Patch "
        "Catalog & OEM Repo Integration, Job Orchestrator, and Approval "
        "Workflow services until those exist — see the READMEs in this "
        "folder and in Web UI Code for which fixture function maps to "
        "which future service."
    ),
)

# The Next.js dev server runs on :3000; this API runs on :8000. Loosened
# for local development only — a real deployment would restrict this to
# the actual frontend origin(s) and go through the API Gateway (APISIX).
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(compliance.router)
app.include_router(jobs.router)


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}
