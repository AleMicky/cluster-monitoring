import logging
import random
from dataclasses import dataclass

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)

TB = 1024**4


@dataclass
class NodeMetrics:
    is_up: bool
    cpu_usage_percent: float
    memory_usage_percent: float
    disk_usage_percent: float
    total_capacity_bytes: int
    used_capacity_bytes: int
    free_capacity_bytes: int
    iops: float | None = None


class PrometheusService:
    def __init__(self):
        self.base_url = settings.PROMETHEUS_URL.rstrip("/")
        self.simulate = settings.SIMULATE_METRICS

    async def _query(self, query: str) -> dict | None:
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(
                    f"{self.base_url}/api/v1/query",
                    params={"query": query},
                )
                response.raise_for_status()
                return response.json()
        except Exception as exc:
            logger.warning("Prometheus query failed: %s", exc)
            return None

    def _extract_scalar(self, data: dict | None) -> float | None:
        if not data or data.get("status") != "success":
            return None
        result = data.get("data", {}).get("result", [])
        if not result:
            return None
        try:
            return float(result[0]["value"][1])
        except (KeyError, IndexError, ValueError):
            return None

    async def query_node_up(self, job: str, instance: str) -> bool | None:
        query = f'up{{job="{job}", instance="{instance}"}}'
        value = self._extract_scalar(await self._query(query))
        if value is None:
            return None
        return value == 1.0

    async def query_cpu_usage(self, instance: str) -> float | None:
        query = (
            f'100 - (avg by(instance) (rate(node_cpu_seconds_total{{mode="idle", instance="{instance}"}}[5m])) * 100)'
        )
        return self._extract_scalar(await self._query(query))

    async def query_memory_usage(self, instance: str) -> float | None:
        query = (
            f'(1 - (node_memory_MemAvailable_bytes{{instance="{instance}"}} / '
            f'node_memory_MemTotal_bytes{{instance="{instance}"}})) * 100'
        )
        return self._extract_scalar(await self._query(query))

    async def query_disk_capacity(self, instance: str) -> tuple[int, int, int] | None:
        total_query = f'sum(node_filesystem_size_bytes{{instance="{instance}", fstype!="tmpfs"}})'
        avail_query = f'sum(node_filesystem_avail_bytes{{instance="{instance}", fstype!="tmpfs"}})'

        total = self._extract_scalar(await self._query(total_query))
        avail = self._extract_scalar(await self._query(avail_query))

        if total is None or avail is None:
            return None

        total_bytes = int(total)
        free_bytes = int(avail)
        used_bytes = total_bytes - free_bytes
        return total_bytes, used_bytes, free_bytes

    async def query_iops(self, instance: str) -> float | None:
        query = f'sum(rate(node_disk_reads_completed_total{{instance="{instance}"}}[5m]) + rate(node_disk_writes_completed_total{{instance="{instance}"}}[5m]))'
        return self._extract_scalar(await self._query(query))

    def _simulate_metrics(
        self, node_name: str, total_disk_bytes: int, used_disk_bytes: int
    ) -> NodeMetrics:
        seed = sum(ord(c) for c in node_name)
        rng = random.Random(seed)

        is_up = rng.random() > 0.05
        cpu = round(rng.uniform(15, 75), 2)
        memory = round(rng.uniform(30, 80), 2)
        usage_percent = (used_disk_bytes / total_disk_bytes * 100) if total_disk_bytes else 0
        free_bytes = total_disk_bytes - used_disk_bytes

        return NodeMetrics(
            is_up=is_up,
            cpu_usage_percent=cpu,
            memory_usage_percent=memory,
            disk_usage_percent=round(usage_percent, 2),
            total_capacity_bytes=total_disk_bytes,
            used_capacity_bytes=used_disk_bytes,
            free_capacity_bytes=free_bytes,
            iops=round(rng.uniform(100, 5000), 2),
        )

    async def get_node_metrics(
        self,
        job: str,
        instance: str,
        node_name: str,
        total_disk_bytes: int,
        used_disk_bytes: int,
    ) -> NodeMetrics:
        if self.simulate:
            prom_up = await self.query_node_up(job, instance)
            if prom_up is None:
                return self._simulate_metrics(node_name, total_disk_bytes, used_disk_bytes)

        is_up = await self.query_node_up(job, instance)
        if is_up is None and self.simulate:
            return self._simulate_metrics(node_name, total_disk_bytes, used_disk_bytes)

        if is_up is False:
            return NodeMetrics(
                is_up=False,
                cpu_usage_percent=0,
                memory_usage_percent=0,
                disk_usage_percent=0,
                total_capacity_bytes=total_disk_bytes,
                used_capacity_bytes=used_disk_bytes,
                free_capacity_bytes=total_disk_bytes - used_disk_bytes,
            )

        cpu = await self.query_cpu_usage(instance)
        memory = await self.query_memory_usage(instance)
        disk = await self.query_disk_capacity(instance)
        iops = await self.query_iops(instance)

        if cpu is None or memory is None:
            if self.simulate:
                return self._simulate_metrics(node_name, total_disk_bytes, used_disk_bytes)
            cpu = cpu or 0.0
            memory = memory or 0.0

        if disk:
            total_bytes, used_bytes, free_bytes = disk
        else:
            total_bytes = total_disk_bytes
            used_bytes = used_disk_bytes
            free_bytes = total_disk_bytes - used_disk_bytes

        usage_percent = (used_bytes / total_bytes * 100) if total_bytes else 0

        return NodeMetrics(
            is_up=True,
            cpu_usage_percent=round(cpu, 2),
            memory_usage_percent=round(memory, 2),
            disk_usage_percent=round(usage_percent, 2),
            total_capacity_bytes=total_bytes,
            used_capacity_bytes=used_bytes,
            free_capacity_bytes=free_bytes,
            iops=iops,
        )
