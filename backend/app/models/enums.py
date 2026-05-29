import enum


class NodeStatus(str, enum.Enum):
    UP = "UP"
    DOWN = "DOWN"


class DiskType(str, enum.Enum):
    HDD = "HDD"
    SSD = "SSD"
    NVME = "NVME"


class HealthStatus(str, enum.Enum):
    HEALTHY = "HEALTHY"
    WARNING = "WARNING"
    CRITICAL = "CRITICAL"


class AlertType(str, enum.Enum):
    NODE_DOWN = "NODE_DOWN"
    DISK_USAGE = "DISK_USAGE"
    CPU_USAGE = "CPU_USAGE"
    MEMORY_USAGE = "MEMORY_USAGE"


class AlertSeverity(str, enum.Enum):
    INFO = "INFO"
    WARNING = "WARNING"
    CRITICAL = "CRITICAL"


class AlertStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    RESOLVED = "RESOLVED"
