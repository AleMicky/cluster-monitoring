import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB", "PB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat("es-BO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

export const DEPARTMENTS = [
  "La Paz",
  "Cochabamba",
  "Santa Cruz",
  "Oruro",
  "Potosí",
  "Chuquisaca",
  "Tarija",
  "Beni",
  "Pando",
] as const;

export const ALERT_TYPE_LABELS: Record<string, string> = {
  NODE_DOWN: "Nodo caído",
  DISK_USAGE: "Uso de disco",
  CPU_USAGE: "Uso de CPU",
  MEMORY_USAGE: "Uso de memoria",
};

export const SEVERITY_COLORS: Record<string, string> = {
  INFO: "bg-blue-100 text-blue-800",
  WARNING: "bg-yellow-100 text-yellow-800",
  CRITICAL: "bg-red-100 text-red-800",
};

export const STATUS_COLORS: Record<string, string> = {
  UP: "bg-green-100 text-green-800",
  DOWN: "bg-red-100 text-red-800",
  ACTIVE: "bg-orange-100 text-orange-800",
  RESOLVED: "bg-gray-100 text-gray-800",
  HEALTHY: "bg-green-100 text-green-800",
  WARNING: "bg-yellow-100 text-yellow-800",
  CRITICAL: "bg-red-100 text-red-800",
};

export const CHART_COLORS = [
  "#2563eb",
  "#16a34a",
  "#dc2626",
  "#ca8a04",
  "#9333ea",
  "#0891b2",
  "#ea580c",
  "#4f46e5",
  "#be185d",
];
