from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.map import MapNodeResponse
from app.services.map_service import MapService

router = APIRouter(prefix="/map", tags=["Map"])


@router.get("/nodes", response_model=list[MapNodeResponse])
def get_map_nodes(db: Session = Depends(get_db)) -> list[MapNodeResponse]:
    service = MapService(db)
    return service.get_map_nodes()
