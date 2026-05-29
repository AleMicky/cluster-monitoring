"use client";

import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  HardDrive,
  Server,
  ServerCrash,
} from "lucide-react";
import { CapacityByDepartmentChart } from "@/components/charts/cluster-charts";
import { BoliviaClusterMapLoader } from "@/components/maps/bolivia-cluster-map-loader";
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
import { ALERT_TYPE_LABELS, formatDate } from "@/lib/utils";

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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
        <Skeleton className="mt-8 h-[580px] rounded-xl" />
        <Skeleton className="mt-8 h-96 rounded-xl" />
      </AppShell>
    );
  }

  if (!data) return null;

  return (
    <AppShell>
      <PageHeader
        title="Dashboard"
        description="Vista ejecutiva del cluster de almacenamiento nacional"
        badge="Tiempo real"
        onRefresh={() => refetch()}
        isRefreshing={isFetching}
      />

      <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Resumen del cluster
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCardBytes
          title="Capacidad total cluster"
          bytes={data.total_capacity_bytes}
          icon={HardDrive}
          variant="info"
        />
        <StatCardBytes
          title="Capacidad usada"
          bytes={data.used_capacity_bytes}
          icon={Server}
          variant="warning"
        />
        <StatCardBytes
          title="Capacidad libre"
          bytes={data.free_capacity_bytes}
          icon={HardDrive}
          variant="success"
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
          title="Alertas críticas"
          value={String(data.critical_alerts)}
          icon={AlertTriangle}
          variant={data.critical_alerts > 0 ? "danger" : "default"}
        />
      </div>

      <div className="mt-8">
        <BoliviaClusterMapLoader />
      </div>

      <p className="mb-4 mt-10 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Capacidad regional
      </p>
      <CapacityByDepartmentChart data={data.capacity_by_department} />

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Alertas recientes</CardTitle>
          <CardDescription>Eventos que requieren atención en el cluster</CardDescription>
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
                  <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                    No hay alertas recientes — cluster estable
                  </TableCell>
                </TableRow>
              ) : (
                data.recent_alerts.map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell className="font-medium text-cyan-300/90">{alert.node_name}</TableCell>
                    <TableCell>{alert.department}</TableCell>
                    <TableCell>{ALERT_TYPE_LABELS[alert.type] || alert.type}</TableCell>
                    <TableCell>
                      <StatusBadge value={alert.severity} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge value={alert.status} />
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground">
                      {alert.message}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {formatDate(alert.triggered_at)}
                    </TableCell>
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
