import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routers import alerts, dashboard, nodes, sync

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Storage Cluster Monitoring API",
    description="API para monitoreo de clusters de almacenamiento distribuidos en Bolivia",
    version="1.0.0",
)

origins = [origin.strip() for origin in settings.CORS_ORIGINS.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(dashboard.router, prefix="/api")
app.include_router(nodes.router, prefix="/api")
app.include_router(alerts.router, prefix="/api")
app.include_router(sync.router, prefix="/api")


@app.get("/health")
def health_check() -> dict:
    return {"status": "ok", "service": "storage-cluster-monitoring"}


@app.on_event("startup")
def startup_event() -> None:
    from app.core.database import SessionLocal
    from app.seed.seed_departments import SeedService

    db = SessionLocal()
    try:
        seed = SeedService(db)
        result = seed.seed_departments(force=False)
        logger.info("Startup seed: %s", result.get("message"))
    except Exception as exc:
        logger.warning("Startup seed skipped: %s", exc)
    finally:
        db.close()
