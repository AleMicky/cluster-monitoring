"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Cpu, HardDrive, MemoryStick } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { DiskUsageChart, MetricsHistoryChart } from "@/components/charts/cluster-charts";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { alertsApi, nodesApi } from "@/lib/api";
import { ALERT_TYPE_LABELS, formatBytes, formatDate, formatPercent } from "@/lib/utils";

export default function NodeDetailPage() {
  const params = useParams();
  const nodeId = Number(params.id);

  const { data: node, isLoading: nodeLoading } = useQuery({
    queryKey: ["node", nodeId],
    queryFn: () => nodesApi.getById(nodeId),
    enabled: !isNaN(nodeId),
  });

  const { data: disks } = useQuery({
    queryKey: ["node-disks", nodeId],
    queryFn: () => nodesApi.getDisks(nodeId),
    enabled: !isNaN(nodeId),
  });

  const { data: metrics } = useQuery({
    queryKey: ["node-metrics", nodeId],
    queryFn: () => nodesApi.getMetrics(nodeId),
    enabled: !isNaN(nodeId),
  });

  const { data: alerts } = useQuery({
    queryKey: ["node-alerts", nodeId],
    queryFn: () => alertsApi.getAll(),
    select: (data) => data.filter((a) => a.node_id === nodeId),
    enabled: !isNaN(nodeId),
  });

  if (nodeLoading) {
    return (
      <AppShell>
        <Skeleton className="h-96" />
      </AppShell>
    );
  }

  if (!node) {
    return (
      <AppShell>
        <p>Nodo no encontrado</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/nodes">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Link>
        </Button>
      </AppShell>
    );
  }

  const latestMetric = metrics?.[0];
  const diskChartData =
    disks?.map((d) => ({
      label: d.device_name.replace("/dev/", ""),
      usage: d.usage_percent,
    })) || [];

  const metricsChartData =
    metrics?.slice(0, 12).map((m) => ({
      time: new Date(m.recorded_at).toLocaleTimeString("es-BO", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      cpu: m.cpu_usage_percent,
      memory: m.memory_usage_percent,
      disk: m.disk_usage_percent,
    })) || [];

  return (
    <AppShell>
      <div className="mb-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/nodes">
            <ArrowLeft className="h-4 w-4" />
            Volver a nodos
          </Link>
        </Button>
      </div>

      <PageHeader
        title={node.name}
        description={`${node.department} · ${node.hostname} · ${node.ip_address}`}
        badge={node.department}
      />

      <div className="mb-6 flex items-center gap-3">
        <StatusBadge value={node.status} />
        {node.last_seen_at && (
          <span className="text-sm text-muted-foreground">
            Última conexión: {formatDate(node.last_seen_at)}
          </span>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          {
            title: "Capacidad total",
            value: formatBytes(node.total_capacity_bytes || 0),
            sub: `Usado ${formatBytes(node.used_capacity_bytes || 0)} (${formatPercent(node.usage_percent || 0)})`,
            icon: HardDrive,
            color: "text-cyan-400",
            bg: "bg-cyan-500/15",
          },
          {
            title: "CPU",
            value: latestMetric ? formatPercent(latestMetric.cpu_usage_percent) : "—",
            icon: Cpu,
            color: "text-violet-400",
            bg: "bg-violet-500/15",
          },
          {
            title: "Memoria",
            value: latestMetric ? formatPercent(latestMetric.memory_usage_percent) : "—",
            icon: MemoryStick,
            color: "text-emerald-400",
            bg: "bg-emerald-500/15",
          },
        ].map((item) => (
          <Card key={item.title} className="glass-panel-hover">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{item.title}</CardTitle>
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${item.bg}`}>
                <item.icon className={`h-4 w-4 ${item.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <p className="font-mono text-2xl font-bold">{item.value}</p>
              {item.sub && <p className="mt-1 text-xs text-muted-foreground">{item.sub}</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <DiskUsageChart data={diskChartData} />
        {metricsChartData.length > 0 && <MetricsHistoryChart data={metricsChartData} />}
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-lg">Discos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dispositivo</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Montaje</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Usado</TableHead>
                <TableHead>Uso</TableHead>
                <TableHead>Salud</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {disks?.map((disk) => (
                <TableRow key={disk.id}>
                  <TableCell className="font-mono">{disk.device_name}</TableCell>
                  <TableCell>{disk.disk_type}</TableCell>
                  <TableCell>{disk.mount_point}</TableCell>
                  <TableCell>{formatBytes(disk.total_bytes)}</TableCell>
                  <TableCell>{formatBytes(disk.used_bytes)}</TableCell>
                  <TableCell>{formatPercent(disk.usage_percent)}</TableCell>
                  <TableCell>
                    <StatusBadge value={disk.health_status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-lg">Alertas del nodo</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Severidad</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Mensaje</TableHead>
                <TableHead>Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!alerts?.length ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Sin alertas para este nodo
                  </TableCell>
                </TableRow>
              ) : (
                alerts.map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell>{ALERT_TYPE_LABELS[alert.type] || alert.type}</TableCell>
                    <TableCell>
                      <StatusBadge value={alert.severity} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge value={alert.status} />
                    </TableCell>
                    <TableCell>{alert.message}</TableCell>
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
