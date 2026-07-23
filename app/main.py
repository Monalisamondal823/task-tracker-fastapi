from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from . import models
from .database import engine
from .routers import auth, tasks
from .dashboard import router as dashboard_router

models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Task Tracker API",
    description="A small backend showcasing FastAPI + JWT auth + SQL database + S3 uploads, "
    "ready to deploy on AWS EC2 with RDS for the database and S3 for file storage.",
    version="1.0.0",
)

app.include_router(auth.router)
app.include_router(tasks.router)
app.include_router(dashboard_router)

origins = [
    "http://localhost:4173",
    "http://127.0.0.1:4173",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

frontend_dist = Path(__file__).resolve().parents[1] / "frontend" / "dist"
if frontend_dist.exists():
    app.mount(
        "/dashboard/assets",
        StaticFiles(directory=str(frontend_dist / "assets")),
        name="dashboard_assets",
    )

    @app.get("/dashboard", include_in_schema=False)
    @app.get("/dashboard/", include_in_schema=False)
    @app.get("/dashboard/{full_path:path}", include_in_schema=False)
    def serve_dashboard(full_path: str = ""):
        return FileResponse(frontend_dist / "index.html")


@app.get("/health", tags=["health"])
def health_check():
    """Simple health check endpoint - useful for load balancer / EC2 health checks."""
    return {"status": "ok"}
