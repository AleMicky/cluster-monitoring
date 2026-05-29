from datetime import datetime

from pydantic import BaseModel, ConfigDict


class MetricSnapshotResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    node_id: int
    cpu_usage_percent: float
    memory_usage_percent: float
    disk_usage_percent: float
    total_capacity_bytes: int
    used_capacity_bytes: int
    free_capacity_bytes: int
    recorded_at: datetime
