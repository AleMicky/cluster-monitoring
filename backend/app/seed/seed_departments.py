import random
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.models.alert import Alert
from app.models.enums import (
    AlertSeverity,
    AlertStatus,
    AlertType,
    DiskType,
    HealthStatus,
    NodeStatus,
)
from app.models.metric_snapshot import MetricSnapshot
from app.models.storage_disk import StorageDisk
from app.models.storage_node import StorageNode
from app.repositories.storage_node_repository import StorageNodeRepository

TB = 1024**4


DEPARTMENT_NODES = [
    {
        "name": "storage-lpz-01",
        "department": "La Paz",
        "hostname": "storage-lpz-01.local",
        "ip_address": "10.10.1.10",
        "prometheus_job": "storage-nodes",
        "disks": [
            {"device_name": "/dev/sda", "disk_type": DiskType.SSD, "total_tb": 2},
            {"device_name": "/dev/sdb", "disk_type": DiskType.HDD, "total_tb": 4},
        ],
    },
    {
        "name": "storage-cbb-01",
        "department": "Cochabamba",
        "hostname": "storage-cbb-01.local",
        "ip_address": "10.10.2.10",
        "prometheus_job": "storage-nodes",
        "disks": [
            {"device_name": "/dev/sda", "disk_type": DiskType.SSD, "total_tb": 1},
            {"device_name": "/dev/sdb", "disk_type": DiskType.HDD, "total_tb": 2},
        ],
    },
    {
        "name": "storage-scz-01",
        "department": "Santa Cruz",
        "hostname": "storage-scz-01.local",
        "ip_address": "10.10.3.10",
        "prometheus_job": "storage-nodes",
        "disks": [
            {"device_name": "/dev/sda", "disk_type": DiskType.SSD, "total_tb": 4},
            {"device_name": "/dev/sdb", "disk_type": DiskType.HDD, "total_tb": 8},
        ],
    },
    {
        "name": "storage-oru-01",
        "department": "Oruro",
        "hostname": "storage-oru-01.local",
        "ip_address": "10.10.4.10",
        "prometheus_job": "storage-nodes",
        "disks": [
            {"device_name": "/dev/sda", "disk_type": DiskType.SSD, "total_tb": 1},
            {"device_name": "/dev/sdb", "disk_type": DiskType.HDD, "total_tb": 1},
        ],
    },
    {
        "name": "storage-pts-01",
        "department": "Potosí",
        "hostname": "storage-pts-01.local",
        "ip_address": "10.10.5.10",
        "prometheus_job": "storage-nodes",
        "disks": [
            {"device_name": "/dev/sda", "disk_type": DiskType.SSD, "total_tb": 2},
            {"device_name": "/dev/sdb", "disk_type": DiskType.HDD, "total_tb": 2},
        ],
    },
    {
        "name": "storage-chq-01",
        "department": "Chuquisaca",
        "hostname": "storage-chq-01.local",
        "ip_address": "10.10.6.10",
        "prometheus_job": "storage-nodes",
        "disks": [
            {"device_name": "/dev/sda", "disk_type": DiskType.SSD, "total_tb": 1},
            {"device_name": "/dev/sdb", "disk_type": DiskType.HDD, "total_tb": 2},
        ],
    },
    {
        "name": "storage-tja-01",
        "department": "Tarija",
        "hostname": "storage-tja-01.local",
        "ip_address": "10.10.7.10",
        "prometheus_job": "storage-nodes",
        "disks": [
            {"device_name": "/dev/sda", "disk_type": DiskType.SSD, "total_tb": 2},
            {"device_name": "/dev/sdb", "disk_type": DiskType.HDD, "total_tb": 4},
        ],
    },
    {
        "name": "storage-ben-01",
        "department": "Beni",
        "hostname": "storage-ben-01.local",
        "ip_address": "10.10.8.10",
        "prometheus_job": "storage-nodes",
        "disks": [
            {"device_name": "/dev/sda", "disk_type": DiskType.SSD, "total_tb": 1},
            {"device_name": "/dev/sdb", "disk_type": DiskType.HDD, "total_tb": 1},
        ],
    },
    {
        "name": "storage-pan-01",
        "department": "Pando",
        "hostname": "storage-pan-01.local",
        "ip_address": "10.10.9.10",
        "prometheus_job": "storage-nodes",
        "disks": [
            {"device_name": "/dev/sda", "disk_type": DiskType.SSD, "total_tb": 1},
            {"device_name": "/dev/sdb", "disk_type": DiskType.HDD, "total_tb": 1},
        ],
    },
]

# Usage profiles per node for realistic demo data
NODE_USAGE_PROFILES = {
    "storage-lpz-01": {"disk_usage": 0.72, "cpu": 45.0, "memory": 62.0, "status": NodeStatus.UP},
    "storage-cbb-01": {"disk_usage": 0.55, "cpu": 38.0, "memory": 55.0, "status": NodeStatus.UP},
    "storage-scz-01": {"disk_usage": 0.88, "cpu": 72.0, "memory": 78.0, "status": NodeStatus.UP},
    "storage-oru-01": {"disk_usage": 0.35, "cpu": 22.0, "memory": 40.0, "status": NodeStatus.UP},
    "storage-pts-01": {"disk_usage": 0.91, "cpu": 85.0, "memory": 88.0, "status": NodeStatus.UP},
    "storage-chq-01": {"disk_usage": 0.48, "cpu": 30.0, "memory": 50.0, "status": NodeStatus.UP},
    "storage-tja-01": {"disk_usage": 0.65, "cpu": 50.0, "memory": 60.0, "status": NodeStatus.UP},
    "storage-ben-01": {"disk_usage": 0.25, "cpu": 18.0, "memory": 35.0, "status": NodeStatus.UP},
    "storage-pan-01": {"disk_usage": 0.0, "cpu": 0.0, "memory": 0.0, "status": NodeStatus.DOWN},
}


def _health_from_usage(usage_percent: float) -> HealthStatus:
    if usage_percent >= 90:
        return HealthStatus.CRITICAL
    if usage_percent >= 80:
        return HealthStatus.WARNING
    return HealthStatus.HEALTHY


class SeedService:
    def __init__(self, db: Session):
        self.db = db
        self.node_repo = StorageNodeRepository(db)

    def seed_departments(self, force: bool = False) -> dict:
        existing = self.node_repo.get_all()
        if existing and not force:
            return {
                "message": "Los datos ya existen. Use force=true para recrear.",
                "nodes_created": 0,
                "disks_created": 0,
                "metrics_created": 0,
                "alerts_created": 0,
            }

        if force and existing:
            for node in existing:
                self.db.delete(node)
            self.db.commit()

        nodes_created = 0
        disks_created = 0
        metrics_created = 0
        alerts_created = 0

        for node_data in DEPARTMENT_NODES:
            profile = NODE_USAGE_PROFILES.get(node_data["name"], {})
            node = StorageNode(
                name=node_data["name"],
                department=node_data["department"],
                hostname=node_data["hostname"],
                ip_address=node_data["ip_address"],
                prometheus_job=node_data["prometheus_job"],
                status=profile.get("status", NodeStatus.UP),
                last_seen_at=datetime.now(timezone.utc) if profile.get("status") != NodeStatus.DOWN else None,
            )
            self.db.add(node)
            self.db.flush()

            total_node_bytes = 0
            used_node_bytes = 0
            disk_usage_ratio = profile.get("disk_usage", 0.5)

            for idx, disk_data in enumerate(node_data["disks"]):
                total_bytes = int(disk_data["total_tb"] * TB)
                used_bytes = int(total_bytes * disk_usage_ratio)
                free_bytes = total_bytes - used_bytes
                usage_percent = round(disk_usage_ratio * 100, 2)

                disk = StorageDisk(
                    node_id=node.id,
                    device_name=disk_data["device_name"],
                    mount_point=f"/mnt/disk{idx + 1}",
                    filesystem="ext4",
                    disk_type=disk_data["disk_type"],
                    total_bytes=total_bytes,
                    used_bytes=used_bytes,
                    free_bytes=free_bytes,
                    usage_percent=usage_percent,
                    health_status=_health_from_usage(usage_percent),
                )
                self.db.add(disk)
                disks_created += 1
                total_node_bytes += total_bytes
                used_node_bytes += used_bytes

            cpu = profile.get("cpu", random.uniform(20, 60))
            memory = profile.get("memory", random.uniform(30, 70))
            disk_pct = round(disk_usage_ratio * 100, 2)

            now = datetime.now(timezone.utc)
            for hours_ago in range(24, 0, -1):
                jitter = random.uniform(-5, 5)
                snapshot = MetricSnapshot(
                    node_id=node.id,
                    cpu_usage_percent=round(max(0, cpu + jitter), 2),
                    memory_usage_percent=round(max(0, memory + jitter), 2),
                    disk_usage_percent=round(max(0, disk_pct + jitter / 10), 2),
                    total_capacity_bytes=total_node_bytes,
                    used_capacity_bytes=used_node_bytes,
                    free_capacity_bytes=total_node_bytes - used_node_bytes,
                    recorded_at=now - timedelta(hours=hours_ago),
                )
                self.db.add(snapshot)
                metrics_created += 1

            nodes_created += 1

        self.db.flush()

        alerts_data = self._create_sample_alerts()
        alerts_created = len(alerts_data)

        self.db.commit()

        return {
            "message": "Seed completado: 9 departamentos de Bolivia",
            "nodes_created": nodes_created,
            "disks_created": disks_created,
            "metrics_created": metrics_created,
            "alerts_created": alerts_created,
        }

    def _create_sample_alerts(self) -> list[Alert]:
        alerts: list[Alert] = []
        nodes = {n.name: n for n in self.node_repo.get_all()}

        scz = nodes.get("storage-scz-01")
        if scz and scz.disks:
            disk = scz.disks[1]
            alerts.append(
                Alert(
                    node_id=scz.id,
                    disk_id=disk.id,
                    type=AlertType.DISK_USAGE,
                    severity=AlertSeverity.WARNING,
                    message=f"Disco {disk.device_name} en {scz.name} al {disk.usage_percent:.1f}% (advertencia)",
                    status=AlertStatus.ACTIVE,
                    triggered_at=datetime.now(timezone.utc) - timedelta(hours=2),
                )
            )

        pts = nodes.get("storage-pts-01")
        if pts and pts.disks:
            disk = pts.disks[0]
            alerts.append(
                Alert(
                    node_id=pts.id,
                    disk_id=disk.id,
                    type=AlertType.DISK_USAGE,
                    severity=AlertSeverity.CRITICAL,
                    message=f"Disco {disk.device_name} en {pts.name} al {disk.usage_percent:.1f}% (crítico)",
                    status=AlertStatus.ACTIVE,
                    triggered_at=datetime.now(timezone.utc) - timedelta(hours=1),
                )
            )
            alerts.append(
                Alert(
                    node_id=pts.id,
                    type=AlertType.CPU_USAGE,
                    severity=AlertSeverity.WARNING,
                    message=f"CPU en {pts.name} al 85.0%",
                    status=AlertStatus.ACTIVE,
                    triggered_at=datetime.now(timezone.utc) - timedelta(minutes=30),
                )
            )

        pan = nodes.get("storage-pan-01")
        if pan:
            alerts.append(
                Alert(
                    node_id=pan.id,
                    type=AlertType.NODE_DOWN,
                    severity=AlertSeverity.CRITICAL,
                    message=f"Nodo {pan.name} ({pan.department}) no responde",
                    status=AlertStatus.ACTIVE,
                    triggered_at=datetime.now(timezone.utc) - timedelta(hours=3),
                )
            )

        lpz = nodes.get("storage-lpz-01")
        if lpz:
            alerts.append(
                Alert(
                    node_id=lpz.id,
                    type=AlertType.MEMORY_USAGE,
                    severity=AlertSeverity.INFO,
                    message=f"Memoria en {lpz.name} al 62.0%",
                    status=AlertStatus.RESOLVED,
                    triggered_at=datetime.now(timezone.utc) - timedelta(days=1),
                    resolved_at=datetime.now(timezone.utc) - timedelta(hours=20),
                )
            )

        for alert in alerts:
            self.db.add(alert)

        return alerts
