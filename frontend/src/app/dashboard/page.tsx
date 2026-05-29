"use client";

import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  HardDrive,
  Percent,
  Server,
  ServerCrash,
  ServerOff,
} from "lucide-react";
import { CapacityByDepartmentChart, NodeStatusChart } from "@/components/charts/cluster-charts";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard, StatCardBytes } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { dashboardApi } from "@/lib/api";
import { ALERT_TYPE_LABELS, formatDate, formatPercent } from "@/lib/utils";

export default function DashboardPage() {
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: dashboardApi.getSummary,
    refetchInterval: 60_000,
  });

  if (isLoading) {
    return (
      <AppShell>
        <PageHeader title="Dashboard" description="Resumen del cluster de almacenamiento" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </AppShell>
    );
  }

  if (!data) return null;

  return (
    <AppShell>
      <PageHeader
        title="Dashboard"
        description="Monitoreo del cluster de almacenamiento — 9 departamentos de Bolivia"
        onRefresh={() => refetch()}
        isRefreshing={isFetching}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCardBytes title="Capacidad total" bytes={data.total_capacity_bytes} icon={HardDrive} />
        <StatCardBytes title="Capacidad usada" bytes={data.used_capacity_bytes} icon={Server} variant="warning" />
        <StatCardBytes title="Capacidad libre" bytes={data.free_capacity_bytes} icon={HardDrive} variant="success" />
        <StatCard
          title="Porcentaje de uso"
          value={formatPercent(data.usage_percent)}
          icon={Percent}
          variant={data.usage_percent >= 80 ? "danger" : "default"}
        />
        <StatCard
          title="Nodos activos"
          value={String(data.active_nodes)}
          icon={Server}
          variant="success"
        />
        <StatCard
          title="Nodos caídos"
          value={String(data.down_nodes)}
          icon={ServerCrash}
          variant={data.down_nodes > 0 ? "danger" : "default"}
        />
        <StatCard
          title="Discos en warning"
          value={String(data.warning_disks)}
          icon={ServerOff}
          variant={data.warning_disks > 0 ? "warning" : "default"}
        />
        <StatCard
          title="Alertas críticas"
          value={String(data.critical_alerts)}
          icon={AlertTriangle}
          variant={data.critical_alerts > 0 ? "danger" : "default"}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <CapacityByDepartmentChart data={data.capacity_by_department} />
        <NodeStatusChart data={data.node_statuses} />
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-lg">Alertas recientes</CardTitle>
          <CardDescription>Últimas alertas del cluster</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nodo</TableHead>
                <TableHead>Departamento</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Severidad</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Mensaje</TableHead>
                <TableHead>Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.recent_alerts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No hay alertas recientes
                  </TableCell>
                </TableRow>
              ) : (
                data.recent_alerts.map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell className="font-medium">{alert.node_name}</TableCell>
                    <TableCell>{alert.department}</TableCell>
                    <TableCell>{ALERT_TYPE_LABELS[alert.type] || alert.type}</TableCell>
                    <TableCell>
                      <StatusBadge value={alert.severity} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge value={alert.status} />
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{alert.message}</TableCell>
                    <TableCell>{formatDate(alert.triggered_at)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AppShell>
  );
}
