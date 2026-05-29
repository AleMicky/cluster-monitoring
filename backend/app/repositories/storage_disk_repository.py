from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.enums import HealthStatus
from app.models.storage_disk import StorageDisk


class StorageDiskRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_node_id(self, node_id: int) -> list[StorageDisk]:
        stmt = select(StorageDisk).where(StorageDisk.node_id == node_id).order_by(StorageDisk.id)
        return list(self.db.scalars(stmt).all())

    def get_by_id(self, disk_id: int) -> StorageDisk | None:
        stmt = select(StorageDisk).where(StorageDisk.id == disk_id)
        return self.db.scalars(stmt).first()

    def create(self, disk: StorageDisk) -> StorageDisk:
        self.db.add(disk)
        self.db.commit()
        self.db.refresh(disk)
        return disk

    def update_usage(
        self,
        disk: StorageDisk,
        used_bytes: int,
        free_bytes: int,
        usage_percent: float,
        health_status: HealthStatus,
    ) -> StorageDisk:
        disk.used_bytes = used_bytes
        disk.free_bytes = free_bytes
        disk.usage_percent = usage_percent
        disk.health_status = health_status
        self.db.commit()
        self.db.refresh(disk)
        return disk

    def count_by_health_status(self, status: HealthStatus) -> int:
        stmt = select(StorageDisk).where(StorageDisk.health_status == status)
        return len(list(self.db.scalars(stmt).all()))

    def get_all(self) -> list[StorageDisk]:
        stmt = select(StorageDisk).order_by(StorageDisk.id)
        return list(self.db.scalars(stmt).all())
