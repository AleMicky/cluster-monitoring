from typing import Literal

from pydantic import BaseModel, Field

MapDisplayStatus = Literal["UP", "WARNING", "CRITICAL", "DOWN"]


class MapNodeResponse(BaseModel):
    id: int
    department: str
    hostname: str
    ip_address: str
    status: MapDisplayStatus
    latitude: float = Field(..., description="Latitud del departamento")
    longitude: float = Field(..., description="Longitud del departamento")
    total_capacity_tb: float
    used_capacity_tb: float
    free_capacity_tb: float
    disk_count: int
    active_alerts: int

    model_config = {"from_attributes": True}
