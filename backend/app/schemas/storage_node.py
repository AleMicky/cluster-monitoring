from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import NodeStatus


class StorageNodeBase(BaseModel):
    name: str = Field(..., max_length=100)
    department: str = Field(..., max_length=100)
    hostname: str = Field(..., max_length=255)
    ip_address: str = Field(..., max_length=45)
    prometheus_job: str = Field(..., max_length=100)


class StorageNodeCreate(StorageNodeBase):
    pass


class StorageNodeUpdate(BaseModel):
    name: str | None = Field(None, max_length=100)
    department: str | None = Field(None, max_length=100)
    hostname: str | None = Field(None, max_length=255)
    ip_address: str | None = Field(None, max_length=45)
    prometheus_job: str | None = Field(None, max_length=100)
    status: NodeStatus | None = None


class StorageNodeResponse(StorageNodeBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    status: NodeStatus
    last_seen_at: datetime | None
    created_at: datetime
    updated_at: datetime


class StorageNodeWithCapacity(StorageNodeResponse):
    total_capacity_bytes: int = 0
    used_capacity_bytes: int = 0
    free_capacity_bytes: int = 0
    usage_percent: float = 0.0
