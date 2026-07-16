from fastapi import FastAPI

from app.routers import compliance, inventory, jobs

app = FastAPI(title="PatchPilot Backend")

app.include_router(jobs.router)
app.include_router(compliance.router)
app.include_router(inventory.router)


@app.get("/")
def read_root():
    return {"message": "Hello, World!"}
