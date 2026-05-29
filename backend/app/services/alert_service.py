from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models.alert import Alert
from app.models.enums import AlertSeverity, AlertStatus, AlertType, HealthStatus, NodeStatus
from app.models.metric_snapshot import MetricSnapshot
from app.models.storage_disk import StorageDisk
from app.models.storage_node import StorageNode
from app.repositories.alert_repository import AlertRepository
from app.repositories.metric_snapshot_repository import MetricSnapshotRepository
from app.repositories.storage_disk_repository import StorageDiskRepository
from app.repositories.storage_node_repository import StorageNodeRepository
from app.schemas.alert import AlertResponse
from app.services.prometheus_service import NodeMetrics, PrometheusService


class AlertService:
    DISK_WARNING_THRESHOLD = 80.0
    DISK_CRITICAL_THRESHOLD = 90.0
    MEMORY_WARNING_THRESHOLD = 85.0
    CPU_WARNING_THRESHOLD = 90.0

    def __init__(self, db: Session):
        self.db = db
        self.alert_repo = AlertRepository(db)
        self.node_repo = StorageNodeRepository(db)
        self.disk_repo = StorageDiskRepository(db)

    def _to_response(self, alert: Alert) -> AlertResponse:
        return AlertResponse(
            id=alert.id,
            node_id=alert.node_id,
            disk_id=alert.disk_id,
            type=alert.type,
            severity=alert.severity,
            message=alert.message,
            status=alert.status,
            triggered_at=alert.triggered_at,
            resolved_at=alert.resolved_at,
            node_name=alert.node.name if alert.node else None,
            department=alert.node.department if alert.node else None,
        )

    def get_all_alerts(self, status: AlertStatus | None = None) -> list[AlertResponse]:
        alerts = self.alert_repo.get_all(status=status)
        return [self._to_response(a) for a in alerts]

    def get_recent_alerts(self, limit: int = 10) -> list[AlertResponse]:
        alerts = self.alert_repo.get_all(limit=limit)
        return [self._to_response(a) for a in alerts]

    def get_critical_alerts_count(self) -> int:
        return self.alert_repo.count_active_by_severity(AlertSeverity.CRITICAL)

    def get_alerts_by_node(self, node_id: int) -> list[AlertResponse]:
        alerts = self.alert_repo.get_by_node_id(node_id)
        return [self._to_response(a) for a in alerts]

    def _create_or_keep_alert(
        self,
        node_id: int,
        alert_type: AlertType,
        severity: AlertSeverity,
        message: str,
        disk_id: int | None = None,
    ) -> Alert:
        existing = self.alert_repo.get_active_by_type_and_node(node_id, alert_type, disk_id)
        if existing:
            return existing
        alert = Alert(
            node_id=node_id,
            disk_id=disk_id,
            type=alert_type,
            severity=severity,
            message=message,
            status=AlertStatus.ACTIVE,
            triggered_at=datetime.now(timezone.utc),
        )
        return self.alert_repo.create(alert)

    def _resolve_alert_if_exists(
        self, node_id: int, alert_type: AlertType, disk_id: int | None = None
    ) -> None:
        existing = self.alert_repo.get_active_by_type_and_node(node_id, alert_type, disk_id)
        if existing:
            self.alert_repo.resolve(existing)

    def evaluate_disk_alerts(self, disk: StorageDisk, node: StorageNode) -> None:
        usage = disk.usage_percent
        if usage >= self.DISK_CRITICAL_THRESHOLD:
            self._create_or_keep_alert(
                node.id,
                AlertType.DISK_USAGE,
                AlertSeverity.CRITICAL,
                f"Disco {disk.device_name} en {node.name} al {usage:.1f}% (crítico)",
                disk.id,
            )
        elif usage >= self.DISK_WARNING_THRESHOLD:
            self._create_or_keep_alert(
                node.id,
                AlertType.DISK_USAGE,
                AlertSeverity.WARNING,
                f"Disco {disk.device_name} en {node.name} al {usage:.1f}% (advertencia)",
                disk.id,
            )
        else:
            self._resolve_alert_if_exists(node.id, AlertType.DISK_USAGE, disk.id)

    def evaluate_node_down(self, node: StorageNode, is_up: bool) -> None:
        if not is_up:
            self._create_or_keep_alert(
                node.id,
                AlertType.NODE_DOWN,
                AlertSeverity.CRITICAL,
                f"Nodo {node.name} ({node.department}) no responde",
            )
        else:
            self._resolve_alert_if_exists(node.id, AlertType.NODE_DOWN)

    def evaluate_cpu_alert(self, node: StorageNode, cpu_percent: float) -> None:
        if cpu_percent >= self.CPU_WARNING_THRESHOLD:
            self._create_or_keep_alert(
                node.id,
                AlertType.CPU_USAGE,
                AlertSeverity.WARNING,
                f"CPU en {node.name} al {cpu_percent:.1f}%",
            )
        else:
            self._resolve_alert_if_exists(node.id, AlertType.CPU_USAGE)

    def evaluate_memory_alert(self, node: StorageNode, memory_percent: float) -> None:
        if memory_percent >= self.MEMORY_WARNING_THRESHOLD:
            self._create_or_keep_alert(
                node.id,
                AlertType.MEMORY_USAGE,
                AlertSeverity.WARNING,
                f"Memoria en {node.name} al {memory_percent:.1f}%",
            )
        else:
            self._resolve_alert_if_exists(node.id, AlertType.MEMORY_USAGE)

    @staticmethod
    def _health_from_usage(usage_percent: float) -> HealthStatus:
        if usage_percent >= 90:
            return HealthStatus.CRITICAL
        if usage_percent >= 80:
            return HealthStatus.WARNING
        return HealthStatus.HEALTHY


class SyncService:
    def __init__(self, db: Session):
        self.db = db
        self.node_repo = StorageNodeRepository(db)
        self.disk_repo = StorageDiskRepository(db)
        self.metric_repo = MetricSnapshotRepository(db)
        self.alert_service = AlertService(db)
        self.prometheus = PrometheusService()

    async def sync_from_prometheus(self) -> dict:
        nodes = self.node_repo.get_all()
        synced = 0

        for node in nodes:
            total_disk = sum(d.total_bytes for d in node.disks)
            used_disk = sum(d.used_bytes for d in node.disks)
            instance = f"{node.ip_address}:9100"

            metrics: NodeMetrics = await self.prometheus.get_node_metrics(
                job=node.prometheus_job,
                instance=instance,
                node_name=node.name,
                total_disk_bytes=total_disk,
                used_disk_bytes=used_disk,
            )

            status = NodeStatus.UP if metrics.is_up else NodeStatus.DOWN
            self.node_repo.update_status(node, status)

            for disk in node.disks:
                ratio = disk.total_bytes / total_disk if total_disk else 0
                disk_used = int(metrics.used_capacity_bytes * ratio)
                disk_free = disk.total_bytes - disk_used
                disk_usage = (disk_used / disk.total_bytes * 100) if disk.total_bytes else 0
                health = AlertService._health_from_usage(disk_usage)

                self.disk_repo.update_usage(disk, disk_used, disk_free, round(disk_usage, 2), health)
                self.alert_service.evaluate_disk_alerts(disk, node)

            self.alert_service.evaluate_node_down(node, metrics.is_up)
            self.alert_service.evaluate_cpu_alert(node, metrics.cpu_usage_percent)
            self.alert_service.evaluate_memory_alert(node, metrics.memory_usage_percent)

            snapshot = MetricSnapshot(
                node_id=node.id,
                cpu_usage_percent=metrics.cpu_usage_percent,
                memory_usage_percent=metrics.memory_usage_percent,
                disk_usage_percent=metrics.disk_usage_percent,
                total_capacity_bytes=metrics.total_capacity_bytes,
                used_capacity_bytes=metrics.used_capacity_bytes,
                free_capacity_bytes=metrics.free_capacity_bytes,
                recorded_at=datetime.now(timezone.utc),
            )
            self.metric_repo.create(snapshot)
            synced += 1

        return {"synced_nodes": synced, "message": f"Sincronizados {synced} nodos desde Prometheus"}
