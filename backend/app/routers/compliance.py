from fastapi import APIRouter

router = APIRouter(prefix="/api/compliance", tags=["compliance"])


@router.get("/hello")
def hello_compliance():
    return {"message": "Hello from compliance router"}
