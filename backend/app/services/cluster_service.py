from sqlalchemy.orm import Session

from app.models.enums import HealthStatus, NodeStatus
from app.models.storage_node import StorageNode
from app.repositories.storage_disk_repository import StorageDiskRepository
from app.repositories.storage_node_repository import StorageNodeRepository
from app.schemas.dashboard import DashboardSummary, DepartmentCapacity, NodeStatusSummary
from app.schemas.storage_node import StorageNodeWithCapacity
from app.services.alert_service import AlertService


class ClusterService:
    def __init__(self, db: Session):
        self.db = db
        self.node_repo = StorageNodeRepository(db)
        self.disk_repo = StorageDiskRepository(db)
        self.alert_service = AlertService(db)

    def _node_capacity(self, node: StorageNode) -> tuple[int, int, int, float]:
        total = sum(d.total_bytes for d in node.disks)
        used = sum(d.used_bytes for d in node.disks)
        free = sum(d.free_bytes for d in node.disks)
        usage = (used / total * 100) if total else 0.0
        return total, used, free, round(usage, 2)

    def get_cluster_capacity(self) -> tuple[int, int, int, float]:
        nodes = self.node_repo.get_all()
        total = sum(sum(d.total_bytes for d in n.disks) for n in nodes)
        used = sum(sum(d.used_bytes for d in n.disks) for n in nodes)
        free = sum(sum(d.free_bytes for d in n.disks) for n in nodes)
        usage = (used / total * 100) if total else 0.0
        return total, used, free, round(usage, 2)

    def get_active_nodes_count(self) -> int:
        return self.node_repo.count_by_status(NodeStatus.UP)

    def get_down_nodes_count(self) -> int:
        return self.node_repo.count_by_status(NodeStatus.DOWN)

    def get_warning_disks_count(self) -> int:
        return self.disk_repo.count_by_health_status(HealthStatus.WARNING)

    def get_nodes_with_capacity(self) -> list[StorageNodeWithCapacity]:
        nodes = self.node_repo.get_all()
        result = []
        for node in nodes:
            total, used, free, usage = self._node_capacity(node)
            result.append(
                StorageNodeWithCapacity(
                    id=node.id,
                    name=node.name,
                    department=node.department,
                    hostname=node.hostname,
                    ip_address=node.ip_address,
                    prometheus_job=node.prometheus_job,
                    status=node.status,
                    last_seen_at=node.last_seen_at,
                    created_at=node.created_at,
                    updated_at=node.updated_at,
                    total_capacity_bytes=total,
                    used_capacity_bytes=used,
                    free_capacity_bytes=free,
                    usage_percent=usage,
                )
            )
        return result

    def get_capacity_by_department(self) -> list[DepartmentCapacity]:
        nodes = self.node_repo.get_all()
        departments: dict[str, DepartmentCapacity] = {}

        for node in nodes:
            total, used, _, usage = self._node_capacity(node)
            if node.department in departments:
                existing = departments[node.department]
                new_total = existing.total_capacity_bytes + total
                new_used = existing.used_capacity_bytes + used
                new_usage = (new_used / new_total * 100) if new_total else 0
                departments[node.department] = DepartmentCapacity(
                    department=node.department,
                    total_capacity_bytes=new_total,
                    used_capacity_bytes=new_used,
                    usage_percent=round(new_usage, 2),
                )
            else:
                departments[node.department] = DepartmentCapacity(
                    department=node.department,
                    total_capacity_bytes=total,
                    used_capacity_bytes=used,
                    usage_percent=usage,
                )

        return sorted(departments.values(), key=lambda d: d.department)

    def get_node_statuses(self) -> list[NodeStatusSummary]:
        nodes = self.node_repo.get_all()
        return [
            NodeStatusSummary(
                department=n.department,
                status=n.status.value,
                node_name=n.name,
            )
            for n in nodes
        ]

    def get_dashboard_summary(self) -> DashboardSummary:
        total, used, free, usage = self.get_cluster_capacity()
        recent_alerts = self.alert_service.get_recent_alerts(limit=10)

        return DashboardSummary(
            total_capacity_bytes=total,
            used_capacity_bytes=used,
            free_capacity_bytes=free,
            usage_percent=usage,
            active_nodes=self.get_active_nodes_count(),
            down_nodes=self.get_down_nodes_count(),
            warning_disks=self.get_warning_disks_count(),
            critical_alerts=self.alert_service.get_critical_alerts_count(),
            capacity_by_department=self.get_capacity_by_department(),
            node_statuses=self.get_node_statuses(),
            recent_alerts=recent_alerts,
            nodes=self.get_nodes_with_capacity(),
        )
