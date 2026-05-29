from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models.alert import Alert
from app.models.enums import AlertSeverity, AlertStatus, HealthStatus, NodeStatus
from app.models.storage_node import StorageNode
from app.repositories.storage_node_repository import StorageNodeRepository
from app.schemas.map import MapDisplayStatus, MapNodeResponse

TB = 1024**4

DEPARTMENT_COORDINATES: dict[str, tuple[float, float]] = {
    "La Paz": (-16.5000, -68.1500),
    "Cochabamba": (-17.3895, -66.1568),
    "Santa Cruz": (-17.7833, -63.1821),
    "Oruro": (-17.9833, -67.1500),
    "Potosí": (-19.5836, -65.7531),
    "Chuquisaca": (-19.0475, -65.2592),
    "Tarija": (-21.5355, -64.7296),
    "Beni": (-14.8333, -64.9000),
    "Pando": (-11.0267, -68.7692),
}


class MapService:
    def __init__(self, db: Session):
        self.db = db
        self.node_repo = StorageNodeRepository(db)

    @staticmethod
    def _bytes_to_tb(value: int) -> float:
        return round(value / TB, 2)

    @staticmethod
    def _derive_display_status(node: StorageNode) -> MapDisplayStatus:
        if node.status == NodeStatus.DOWN:
            return "DOWN"

        active_alerts = [a for a in node.alerts if a.status == AlertStatus.ACTIVE]
        has_critical_alert = any(a.severity == AlertSeverity.CRITICAL for a in active_alerts)
        has_warning_alert = any(a.severity == AlertSeverity.WARNING for a in active_alerts)

        has_critical_disk = any(d.health_status == HealthStatus.CRITICAL for d in node.disks)
        has_warning_disk = any(d.health_status == HealthStatus.WARNING for d in node.disks)

        if has_critical_alert or has_critical_disk:
            return "CRITICAL"
        if has_warning_alert or has_warning_disk:
            return "WARNING"
        return "UP"

    def _count_active_alerts(self, node_id: int) -> int:
        stmt = select(Alert).where(
            Alert.node_id == node_id,
            Alert.status == AlertStatus.ACTIVE,
        )
        return len(list(self.db.scalars(stmt).all()))

    def get_map_nodes(self) -> list[MapNodeResponse]:
        stmt = (
            select(StorageNode)
            .options(
                selectinload(StorageNode.disks),
                selectinload(StorageNode.alerts),
            )
            .order_by(StorageNode.id)
        )
        nodes = list(self.db.scalars(stmt).all())

        result: list[MapNodeResponse] = []
        for node in nodes:
            coords = DEPARTMENT_COORDINATES.get(node.department)
            if not coords:
                continue

            total_bytes = sum(d.total_bytes for d in node.disks)
            used_bytes = sum(d.used_bytes for d in node.disks)
            free_bytes = sum(d.free_bytes for d in node.disks)

            result.append(
                MapNodeResponse(
                    id=node.id,
                    department=node.department,
                    hostname=node.hostname,
                    ip_address=node.ip_address,
                    status=self._derive_display_status(node),
                    latitude=coords[0],
                    longitude=coords[1],
                    total_capacity_tb=self._bytes_to_tb(total_bytes),
                    used_capacity_tb=self._bytes_to_tb(used_bytes),
                    free_capacity_tb=self._bytes_to_tb(free_bytes),
                    disk_count=len(node.disks),
                    active_alerts=self._count_active_alerts(node.id),
                )
            )

        return result
