from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.enums import AlertSeverity, AlertStatus, AlertType


class Alert(Base):
    __tablename__ = "alerts"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    node_id: Mapped[int] = mapped_column(ForeignKey("storage_nodes.id", ondelete="CASCADE"), nullable=False)
    disk_id: Mapped[int | None] = mapped_column(
        ForeignKey("storage_disks.id", ondelete="SET NULL"), nullable=True
    )
    type: Mapped[AlertType] = mapped_column(Enum(AlertType, name="alert_type"), nullable=False)
    severity: Mapped[AlertSeverity] = mapped_column(
        Enum(AlertSeverity, name="alert_severity"), nullable=False
    )
    message: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[AlertStatus] = mapped_column(
        Enum(AlertStatus, name="alert_status"), default=AlertStatus.ACTIVE, nullable=False
    )
    triggered_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    node: Mapped["StorageNode"] = relationship("StorageNode", back_populates="alerts")
    disk: Mapped["StorageDisk | None"] = relationship("StorageDisk", back_populates="alerts")


from app.models.storage_node import StorageNode  # noqa: E402, F401
from app.models.storage_disk import StorageDisk  # noqa: E402, F401
