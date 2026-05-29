"use client";

import { Gauge, ShieldCheck, Zap } from "lucide-react";
import { cn, formatBytes, formatPercent } from "@/lib/utils";
import type { DashboardSummary } from "@/types";

export function ClusterHero({ data }: { data: DashboardSummary }) {
  const healthScore = Math.max(
    0,
    Math.min(
      100,
      100 -
        data.usage_percent * 0.3 -
        data.down_nodes * 15 -
        data.critical_alerts * 10 -
        data.warning_disks * 5
    )
  );

  const healthLabel =
    healthScore >= 85 ? "Excelente" : healthScore >= 65 ? "Bueno" : healthScore >= 40 ? "Atención" : "Crítico";

  const healthColor =
    healthScore >= 85
      ? "text-emerald-400"
      : healthScore >= 65
        ? "text-cyan-400"
        : healthScore >= 40
          ? "text-amber-400"
          : "text-red-400";

  return (
    <div className="glass-panel relative mb-8 overflow-hidden p-8">
      <div className="shimmer pointer-events-none absolute inset-0" />
      <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-400">
            <Zap className="h-3.5 w-3.5" />
            Plataforma Enterprise · Bolivia
          </div>
          <h2 className="text-2xl font-bold text-white lg:text-3xl">
            Cluster nacional de almacenamiento
          </h2>
          <p className="max-w-xl text-muted-foreground">
            Monitoreo unificado de {data.active_nodes + data.down_nodes} nodos en 9 departamentos.
            Capacidad total de {formatBytes(data.total_capacity_bytes)} con{" "}
            {formatPercent(data.usage_percent)} de utilización.
          </p>
          <div className="flex flex-wrap gap-6 pt-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              <span className="text-sm">
                <span className="font-semibold text-emerald-400">{data.active_nodes}</span>
                <span className="text-muted-foreground"> nodos activos</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Gauge className="h-5 w-5 text-cyan-400" />
              <span className="text-sm">
                <span className="font-semibold text-cyan-400">{formatBytes(data.free_capacity_bytes)}</span>
                <span className="text-muted-foreground"> disponibles</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center">
          <div className="relative flex h-36 w-36 items-center justify-center">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke="hsl(217 33% 18%)"
                strokeWidth="10"
              />
              <circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke="url(#healthGradient)"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${(healthScore / 100) * 327} 327`}
                className="transition-all duration-1000"
              />
              <defs>
                <linearGradient id="healthGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#22d3ee" />
                  <stop offset="100%" stopColor="#34d399" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className={cn("font-mono text-4xl font-bold", healthColor)}>{Math.round(healthScore)}</span>
              <span className="text-xs text-muted-foreground">Salud</span>
            </div>
          </div>
          <p className={cn("mt-3 text-sm font-semibold", healthColor)}>{healthLabel}</p>
        </div>
      </div>
    </div>
  );
}
