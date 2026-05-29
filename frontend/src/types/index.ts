export type NodeStatus = "UP" | "DOWN";
export type MapNodeStatus = "UP" | "WARNING" | "CRITICAL" | "DOWN";
export type DiskType = "HDD" | "SSD" | "NVME";
export type HealthStatus = "HEALTHY" | "WARNING" | "CRITICAL";
export type AlertType = "NODE_DOWN" | "DISK_USAGE" | "CPU_USAGE" | "MEMORY_USAGE";
export type AlertSeverity = "INFO" | "WARNING" | "CRITICAL";
export type AlertStatus = "ACTIVE" | "RESOLVED";

export interface StorageNode {
  id: number;
  name: string;
  department: string;
  hostname: string;
  ip_address: string;
  prometheus_job: string;
  status: NodeStatus;
  last_seen_at: string | null;
  created_at: string;
  updated_at: string;
  total_capacity_bytes?: number;
  used_capacity_bytes?: number;
  free_capacity_bytes?: number;
  usage_percent?: number;
}

export interface StorageNodeCreate {
  name: string;
  department: string;
  hostname: string;
  ip_address: string;
  prometheus_job: string;
}

export interface StorageNodeUpdate {
  name?: string;
  department?: string;
  hostname?: string;
  ip_address?: string;
  prometheus_job?: string;
  status?: NodeStatus;
}

export interface StorageDisk {
  id: number;
  node_id: number;
  device_name: string;
  mount_point: string;
  filesystem: string;
  disk_type: DiskType;
  total_bytes: number;
  used_bytes: number;
  free_bytes: number;
  usage_percent: number;
  health_status: HealthStatus;
  created_at: string;
  updated_at: string;
}

export interface MetricSnapshot {
  id: number;
  node_id: number;
  cpu_usage_percent: number;
  memory_usage_percent: number;
  disk_usage_percent: number;
  total_capacity_bytes: number;
  used_capacity_bytes: number;
  free_capacity_bytes: number;
  recorded_at: string;
}

export interface Alert {
  id: number;
  node_id: number;
  disk_id: number | null;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  status: AlertStatus;
  triggered_at: string;
  resolved_at: string | null;
  node_name?: string | null;
  department?: string | null;
}

export interface DepartmentCapacity {
  department: string;
  used_capacity_bytes: number;
  total_capacity_bytes: number;
  usage_percent: number;
}

export interface NodeStatusSummary {
  department: string;
  status: string;
  node_name: string;
}

export interface MapNode {
  id: number;
  department: string;
  hostname: string;
  ip_address: string;
  status: MapNodeStatus;
  latitude: number;
  longitude: number;
  total_capacity_tb: number;
  used_capacity_tb: number;
  free_capacity_tb: number;
  disk_count: number;
  active_alerts: number;
}

export interface DashboardSummary {
  total_capacity_bytes: number;
  used_capacity_bytes: number;
  free_capacity_bytes: number;
  usage_percent: number;
  active_nodes: number;
  down_nodes: number;
  warning_disks: number;
  critical_alerts: number;
  capacity_by_department: DepartmentCapacity[];
  node_statuses: NodeStatusSummary[];
  recent_alerts: Alert[];
  nodes: StorageNode[];
}
