from fastapi import APIRouter

router = APIRouter(prefix="/api/inventory", tags=["inventory"])


@router.get("/hello")
def hello_inventory():
    return {"message": "Hello from inventory router"}
