from sqlalchemy import desc, select
from sqlalchemy.orm import Session

from app.models.metric_snapshot import MetricSnapshot


class MetricSnapshotRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, snapshot: MetricSnapshot) -> MetricSnapshot:
        self.db.add(snapshot)
        self.db.commit()
        self.db.refresh(snapshot)
        return snapshot

    def get_latest_by_node_id(self, node_id: int) -> MetricSnapshot | None:
        stmt = (
            select(MetricSnapshot)
            .where(MetricSnapshot.node_id == node_id)
            .order_by(desc(MetricSnapshot.recorded_at))
            .limit(1)
        )
        return self.db.scalars(stmt).first()

    def get_history_by_node_id(self, node_id: int, limit: int = 24) -> list[MetricSnapshot]:
        stmt = (
            select(MetricSnapshot)
            .where(MetricSnapshot.node_id == node_id)
            .order_by(desc(MetricSnapshot.recorded_at))
            .limit(limit)
        )
        return list(self.db.scalars(stmt).all())
