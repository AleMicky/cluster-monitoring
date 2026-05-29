import axios from "axios";
import type {
  Alert,
  AlertStatus,
  DashboardSummary,
  MetricSnapshot,
  StorageDisk,
  StorageNode,
  StorageNodeCreate,
  StorageNodeUpdate,
} from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { "Content-Type": "application/json" },
});

export const dashboardApi = {
  getSummary: () => api.get<DashboardSummary>("/dashboard/summary").then((r) => r.data),
};

export const nodesApi = {
  getAll: () => api.get<StorageNode[]>("/nodes").then((r) => r.data),
  getById: (id: number) => api.get<StorageNode>(`/nodes/${id}`).then((r) => r.data),
  create: (data: StorageNodeCreate) => api.post<StorageNode>("/nodes", data).then((r) => r.data),
  update: (id: number, data: StorageNodeUpdate) =>
    api.put<StorageNode>(`/nodes/${id}`, data).then((r) => r.data),
  delete: (id: number) => api.delete(`/nodes/${id}`),
  getDisks: (id: number) => api.get<StorageDisk[]>(`/nodes/${id}/disks`).then((r) => r.data),
  getMetrics: (id: number) => api.get<MetricSnapshot[]>(`/nodes/${id}/metrics`).then((r) => r.data),
};

export const alertsApi = {
  getAll: (status?: AlertStatus) =>
    api
      .get<Alert[]>("/alerts", { params: status ? { status } : undefined })
      .then((r) => r.data),
};

export const operationsApi = {
  syncPrometheus: () =>
    api.post<{ synced_nodes: number; message: string }>("/sync/prometheus").then((r) => r.data),
  seedDepartments: (force = false) =>
    api.post<{ message: string }>("/seed/departments", null, { params: { force } }).then((r) => r.data),
};
