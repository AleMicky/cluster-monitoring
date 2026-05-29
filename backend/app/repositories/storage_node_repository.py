from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models.enums import AlertStatus, NodeStatus
from app.models.storage_node import StorageNode
from app.schemas.storage_node import StorageNodeCreate, StorageNodeUpdate


class StorageNodeRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self) -> list[StorageNode]:
        stmt = select(StorageNode).options(selectinload(StorageNode.disks)).order_by(StorageNode.id)
        return list(self.db.scalars(stmt).all())

    def get_by_id(self, node_id: int) -> StorageNode | None:
        stmt = (
            select(StorageNode)
            .options(
                selectinload(StorageNode.disks),
                selectinload(StorageNode.metric_snapshots),
                selectinload(StorageNode.alerts),
            )
            .where(StorageNode.id == node_id)
        )
        return self.db.scalars(stmt).first()

    def get_by_name(self, name: str) -> StorageNode | None:
        stmt = select(StorageNode).where(StorageNode.name == name)
        return self.db.scalars(stmt).first()

    def create(self, data: StorageNodeCreate) -> StorageNode:
        node = StorageNode(**data.model_dump(), status=NodeStatus.UP)
        self.db.add(node)
        self.db.commit()
        self.db.refresh(node)
        return node

    def update(self, node: StorageNode, data: StorageNodeUpdate) -> StorageNode:
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(node, field, value)
        self.db.commit()
        self.db.refresh(node)
        return node

    def delete(self, node: StorageNode) -> None:
        self.db.delete(node)
        self.db.commit()

    def update_status(self, node: StorageNode, status: NodeStatus) -> StorageNode:
        node.status = status
        node.last_seen_at = datetime.now(timezone.utc)
        self.db.commit()
        self.db.refresh(node)
        return node

    def count_by_status(self, status: NodeStatus) -> int:
        stmt = select(StorageNode).where(StorageNode.status == status)
        return len(list(self.db.scalars(stmt).all()))
