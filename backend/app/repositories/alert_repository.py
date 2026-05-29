from datetime import datetime, timezone

from sqlalchemy import desc, select
from sqlalchemy.orm import Session, selectinload

from app.models.alert import Alert
from app.models.enums import AlertSeverity, AlertStatus, AlertType


class AlertRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, alert: Alert) -> Alert:
        self.db.add(alert)
        self.db.commit()
        self.db.refresh(alert)
        return alert

    def get_all(self, status: AlertStatus | None = None, limit: int = 100) -> list[Alert]:
        stmt = select(Alert).options(selectinload(Alert.node), selectinload(Alert.disk))
        if status:
            stmt = stmt.where(Alert.status == status)
        stmt = stmt.order_by(desc(Alert.triggered_at)).limit(limit)
        return list(self.db.scalars(stmt).all())

    def get_by_node_id(self, node_id: int) -> list[Alert]:
        stmt = (
            select(Alert)
            .options(selectinload(Alert.disk))
            .where(Alert.node_id == node_id)
            .order_by(desc(Alert.triggered_at))
        )
        return list(self.db.scalars(stmt).all())

    def get_active_by_type_and_node(
        self, node_id: int, alert_type: AlertType, disk_id: int | None = None
    ) -> Alert | None:
        stmt = select(Alert).where(
            Alert.node_id == node_id,
            Alert.type == alert_type,
            Alert.status == AlertStatus.ACTIVE,
        )
        if disk_id is not None:
            stmt = stmt.where(Alert.disk_id == disk_id)
        else:
            stmt = stmt.where(Alert.disk_id.is_(None))
        return self.db.scalars(stmt).first()

    def resolve(self, alert: Alert) -> Alert:
        alert.status = AlertStatus.RESOLVED
        alert.resolved_at = datetime.now(timezone.utc)
        self.db.commit()
        self.db.refresh(alert)
        return alert

    def count_active_by_severity(self, severity: AlertSeverity) -> int:
        stmt = select(Alert).where(
            Alert.status == AlertStatus.ACTIVE,
            Alert.severity == severity,
        )
        return len(list(self.db.scalars(stmt).all()))
