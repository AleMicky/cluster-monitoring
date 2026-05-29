from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.enums import AlertSeverity, AlertStatus, AlertType


class AlertResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    node_id: int
    disk_id: int | None
    type: AlertType
    severity: AlertSeverity
    message: str
    status: AlertStatus
    triggered_at: datetime
    resolved_at: datetime | None
    node_name: str | None = None
    department: str | None = None


class AlertListResponse(AlertResponse):
    pass
