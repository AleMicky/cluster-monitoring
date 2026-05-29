from pydantic import BaseModel

from app.schemas.alert import AlertResponse
from app.schemas.storage_node import StorageNodeWithCapacity


class DepartmentCapacity(BaseModel):
    department: str
    used_capacity_bytes: int
    total_capacity_bytes: int
    usage_percent: float


class NodeStatusSummary(BaseModel):
    department: str
    status: str
    node_name: str


class DashboardSummary(BaseModel):
    total_capacity_bytes: int
    used_capacity_bytes: int
    free_capacity_bytes: int
    usage_percent: float
    active_nodes: int
    down_nodes: int
    warning_disks: int
    critical_alerts: int
    capacity_by_department: list[DepartmentCapacity]
    node_statuses: list[NodeStatusSummary]
    recent_alerts: list[AlertResponse]
    nodes: list[StorageNodeWithCapacity]
