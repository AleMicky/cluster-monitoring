from datetime import datetime

from sqlalchemy import DateTime, Enum, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.enums import NodeStatus


class StorageNode(Base):
    __tablename__ = "storage_nodes"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    department: Mapped[str] = mapped_column(String(100), nullable=False)
    hostname: Mapped[str] = mapped_column(String(255), nullable=False)
    ip_address: Mapped[str] = mapped_column(String(45), nullable=False)
    prometheus_job: Mapped[str] = mapped_column(String(100), nullable=False)
    status: Mapped[NodeStatus] = mapped_column(
        Enum(NodeStatus, name="node_status"), default=NodeStatus.UP, nullable=False
    )
    last_seen_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    disks: Mapped[list["StorageDisk"]] = relationship(
        "StorageDisk", back_populates="node", cascade="all, delete-orphan"
    )
    metric_snapshots: Mapped[list["MetricSnapshot"]] = relationship(
        "MetricSnapshot", back_populates="node", cascade="all, delete-orphan"
    )
    alerts: Mapped[list["Alert"]] = relationship(
        "Alert", back_populates="node", cascade="all, delete-orphan"
    )


from app.models.storage_disk import StorageDisk  # noqa: E402, F401
from app.models.metric_snapshot import MetricSnapshot  # noqa: E402, F401
from app.models.alert import Alert  # noqa: E402, F401
