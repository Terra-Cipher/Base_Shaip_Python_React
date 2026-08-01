import os
from fastapi import FastAPI, Request, HTTPException, status
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(
    title="Unified SHAIP Container",
    docs_url="/shaip/docs",
    openapi_url="/shaip/openapi.json"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AdditionRequest(BaseModel):
    num1: float
    num2: float

# Support multiple path entrypoints to ensure compatibility with
# both prefix-stripped and unstripped external proxy configurations.
@app.post("/display/shaip")
@app.post("/display/shaip/")
@app.post("/shaip")
@app.post("/shaip/")
@app.post("/")
async def add_numbers(payload: AdditionRequest):
    return {
        "status": "success",
        "result": payload.num1 + payload.num2
    }

STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")

@app.get("/display/{full_path:path}")
@app.get("/display")
async def serve_react_app(full_path: str = ""):
    # Sanitize path to prevent directory traversal
    safe_path = os.path.normpath(full_path).lstrip("/")
    target_file = os.path.join(STATIC_DIR, safe_path)

    # Prevent escaping the static directory
    if not os.path.commonpath([STATIC_DIR, os.path.abspath(target_file)]) == STATIC_DIR:
        return JSONResponse(
            status_code=status.HTTP_403_FORBIDDEN,
            content={"message": "Forbidden"}
        )

    # Serve static assets if the file exists on disk
    if os.path.isfile(target_file):
        return FileResponse(target_file)

    # Fallback to index.html for UI SPA routing (React Router)
    index_path = os.path.join(STATIC_DIR, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)

    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND, 
        content={"message": "Frontend build assets not found"}
    )