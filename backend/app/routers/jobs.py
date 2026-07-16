from fastapi import APIRouter

router = APIRouter(prefix="/api/jobs", tags=["jobs"])


@router.get("/hello")
def hello_jobs():
    return {"message": "Hello from jobs router"}
