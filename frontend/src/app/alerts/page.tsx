"use client";

import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { alertsApi } from "@/lib/api";
import { ALERT_TYPE_LABELS, formatDate } from "@/lib/utils";
import type { AlertStatus } from "@/types";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function AlertsPage() {
  const [statusFilter, setStatusFilter] = useState<AlertStatus | "ALL">("ALL");

  const { data: alerts, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["alerts", statusFilter],
    queryFn: () =>
      alertsApi.getAll(statusFilter === "ALL" ? undefined : statusFilter),
  });

  return (
    <AppShell>
      <PageHeader
        title="Centro de alertas"
        description="Monitoreo proactivo de incidentes y umbrales del cluster"
        badge="Alerting"
        onRefresh={() => refetch()}
        isRefreshing={isFetching}
        actions={
          <div className="flex gap-2">
            {(["ALL", "ACTIVE", "RESOLVED"] as const).map((s) => (
              <Button
                key={s}
                variant={statusFilter === s ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(s)}
              >
                {s === "ALL" ? "Todas" : s === "ACTIVE" ? "Activas" : "Resueltas"}
              </Button>
            ))}
          </div>
        }
      />

      {isLoading ? (
        <Skeleton className="h-96 rounded-xl" />
      ) : (
        <div className="glass-panel overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nodo</TableHead>
                <TableHead>Departamento</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Severidad</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Mensaje</TableHead>
                <TableHead>Activación</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!alerts?.length ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No hay alertas
                  </TableCell>
                </TableRow>
              ) : (
                alerts.map((alert) => (
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
                    <TableCell className="max-w-md">{alert.message}</TableCell>
                    <TableCell>{formatDate(alert.triggered_at)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </AppShell>
  );
}
