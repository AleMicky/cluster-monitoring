from datetime import datetime

from sqlalchemy import BigInteger, DateTime, Float, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class MetricSnapshot(Base):
    __tablename__ = "metric_snapshots"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    node_id: Mapped[int] = mapped_column(ForeignKey("storage_nodes.id", ondelete="CASCADE"), nullable=False)
    cpu_usage_percent: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    memory_usage_percent: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    disk_usage_percent: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    total_capacity_bytes: Mapped[int] = mapped_column(BigInteger, nullable=False, default=0)
    used_capacity_bytes: Mapped[int] = mapped_column(BigInteger, nullable=False, default=0)
    free_capacity_bytes: Mapped[int] = mapped_column(BigInteger, nullable=False, default=0)
    recorded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    node: Mapped["StorageNode"] = relationship("StorageNode", back_populates="metric_snapshots")


from app.models.storage_node import StorageNode  # noqa: E402, F401
