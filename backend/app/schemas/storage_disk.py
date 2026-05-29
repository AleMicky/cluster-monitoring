from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.enums import DiskType, HealthStatus


class StorageDiskResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    node_id: int
    device_name: str
    mount_point: str
    filesystem: str
    disk_type: DiskType
    total_bytes: int
    used_bytes: int
    free_bytes: int
    usage_percent: float
    health_status: HealthStatus
    created_at: datetime
    updated_at: datetime
