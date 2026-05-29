from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.enums import AlertStatus
from app.schemas.alert import AlertResponse
from app.services.alert_service import AlertService

router = APIRouter(prefix="/alerts", tags=["Alerts"])


@router.get("", response_model=list[AlertResponse])
def list_alerts(
    status: AlertStatus | None = Query(None, description="Filtrar por estado"),
    db: Session = Depends(get_db),
) -> list[AlertResponse]:
    service = AlertService(db)
    return service.get_all_alerts(status=status)
