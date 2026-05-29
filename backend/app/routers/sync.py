from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.seed.seed_departments import SeedService
from app.services.alert_service import SyncService

router = APIRouter(tags=["Operations"])


@router.post("/sync/prometheus")
async def sync_prometheus(db: Session = Depends(get_db)) -> dict:
    service = SyncService(db)
    return await service.sync_from_prometheus()


@router.post("/seed/departments")
def seed_departments(
    force: bool = Query(False, description="Recrear datos si ya existen"),
    db: Session = Depends(get_db),
) -> dict:
    service = SeedService(db)
    return service.seed_departments(force=force)
