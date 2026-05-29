from datetime import datetime

from sqlalchemy import BigInteger, DateTime, Enum, Float, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.enums import DiskType, HealthStatus


class StorageDisk(Base):
    __tablename__ = "storage_disks"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    node_id: Mapped[int] = mapped_column(ForeignKey("storage_nodes.id", ondelete="CASCADE"), nullable=False)
    device_name: Mapped[str] = mapped_column(String(50), nullable=False)
    mount_point: Mapped[str] = mapped_column(String(255), nullable=False, default="/")
    filesystem: Mapped[str] = mapped_column(String(50), nullable=False, default="ext4")
    disk_type: Mapped[DiskType] = mapped_column(Enum(DiskType, name="disk_type"), nullable=False)
    total_bytes: Mapped[int] = mapped_column(BigInteger, nullable=False)
    used_bytes: Mapped[int] = mapped_column(BigInteger, nullable=False, default=0)
    free_bytes: Mapped[int] = mapped_column(BigInteger, nullable=False, default=0)
    usage_percent: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    health_status: Mapped[HealthStatus] = mapped_column(
        Enum(HealthStatus, name="health_status"), default=HealthStatus.HEALTHY, nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    node: Mapped["StorageNode"] = relationship("StorageNode", back_populates="disks")
    alerts: Mapped[list["Alert"]] = relationship("Alert", back_populates="disk")


from app.models.storage_node import StorageNode  # noqa: E402, F401
from app.models.alert import Alert  # noqa: E402, F401
