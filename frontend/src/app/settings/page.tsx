"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Database, RefreshCw, Sprout } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { operationsApi } from "@/lib/api";

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState<string | null>(null);

  const syncMutation = useMutation({
    mutationFn: () => operationsApi.syncPrometheus(),
    onSuccess: (data) => {
      setMessage(data.message);
      queryClient.invalidateQueries();
    },
    onError: () => setMessage("Error al sincronizar con Prometheus"),
  });

  const seedMutation = useMutation({
    mutationFn: (force: boolean) => operationsApi.seedDepartments(force),
    onSuccess: (data: { message: string }) => {
      setMessage(data.message);
      queryClient.invalidateQueries();
    },
    onError: () => setMessage("Error al ejecutar seed"),
  });

  return (
    <AppShell>
      <PageHeader
        title="Configuración"
        description="Operaciones del cluster, integraciones y datos de demostración"
        badge="Admin"
      />

      {message && (
        <div className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-400">
          {message}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="glass-panel-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <RefreshCw className="h-5 w-5 text-cyan-400" />
              Sincronizar Prometheus
            </CardTitle>
            <CardDescription>
              Consulta métricas desde Prometheus y actualiza nodos, discos y alertas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => syncMutation.mutate()}
              disabled={syncMutation.isPending}
            >
              {syncMutation.isPending ? "Sincronizando..." : "Ejecutar sync"}
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-panel-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sprout className="h-5 w-5 text-emerald-400" />
              Seed departamentos
            </CardTitle>
            <CardDescription>
              Carga los 9 nodos de Bolivia con discos, métricas y alertas de ejemplo.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => seedMutation.mutate(false)}
              disabled={seedMutation.isPending}
            >
              Seed (si vacío)
            </Button>
            <Button
              variant="destructive"
              onClick={() => seedMutation.mutate(true)}
              disabled={seedMutation.isPending}
            >
              Recrear todo
            </Button>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Database className="h-5 w-5" />
              Información del sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              <strong>API Backend:</strong>{" "}
              {process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}
            </p>
            <p>
              <strong>Prometheus:</strong> http://localhost:9090
            </p>
            <p>
              <strong>Grafana:</strong> http://localhost:3001
            </p>
            <p>
              <strong>Cluster:</strong> 9 departamentos de Bolivia · Node Exporter · Métricas simuladas
            </p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
