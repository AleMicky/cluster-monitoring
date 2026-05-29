"use client";

import { useEffect, useMemo, useState } from "react";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { AlertCircle, MapPin, RefreshCw } from "lucide-react";
import "leaflet/dist/leaflet.css";
import { useMapNodes } from "@/hooks/use-map-nodes";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { MapNode, MapNodeStatus } from "@/types";

const BOLIVIA_CENTER: L.LatLngExpression = [-16.5, -64.5];
const INITIAL_ZOOM = 5;

const STATUS_COLORS: Record<MapNodeStatus, string> = {
  UP: "#22c55e",
  WARNING: "#eab308",
  CRITICAL: "#ef4444",
  DOWN: "#0f172a",
};

const STATUS_LABELS: Record<MapNodeStatus, string> = {
  UP: "Operativo",
  WARNING: "Advertencia",
  CRITICAL: "Crítico",
  DOWN: "Caído",
};

const FILTER_OPTIONS: Array<{ value: MapNodeStatus | "ALL"; label: string }> = [
  { value: "ALL", label: "Todos" },
  { value: "UP", label: "UP" },
  { value: "WARNING", label: "WARNING" },
  { value: "CRITICAL", label: "CRITICAL" },
  { value: "DOWN", label: "DOWN" },
];

function createStatusIcon(status: MapNodeStatus) {
  const color = STATUS_COLORS[status];
  const border = status === "DOWN" ? "2px solid #94a3b8" : "2px solid rgba(255,255,255,0.9)";

  return L.divIcon({
    className: "cluster-map-marker",
    html: `<span style="
      display:block;
      width:18px;
      height:18px;
      border-radius:50%;
      background:${color};
      border:${border};
      box-shadow:0 0 12px ${color}88, 0 2px 6px rgba(0,0,0,0.45);
    "></span>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -12],
  });
}

function MapResizeHandler() {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => map.invalidateSize(), 100);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

function NodePopup({ node }: { node: MapNode }) {
  return (
    <div className="min-w-[220px] space-y-2 text-sm text-slate-800">
      <p className="border-b border-slate-200 pb-2 font-semibold text-slate-900">
        {node.department}
      </p>
      <dl className="space-y-1.5">
        <div className="flex justify-between gap-4">
          <dt className="text-slate-500">Hostname</dt>
          <dd className="font-mono text-right font-medium">{node.hostname}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-slate-500">IP</dt>
          <dd className="font-mono text-right">{node.ip_address}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-slate-500">Estado</dt>
          <dd>
            <StatusBadge value={node.status} />
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-slate-500">Capacidad Total</dt>
          <dd className="font-medium">{node.total_capacity_tb} TB</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-slate-500">Capacidad Usada</dt>
          <dd className="font-medium">{node.used_capacity_tb} TB</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-slate-500">Capacidad Libre</dt>
          <dd className="font-medium">{node.free_capacity_tb} TB</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-slate-500">Discos</dt>
          <dd className="font-medium">{node.disk_count}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-slate-500">Alertas Activas</dt>
          <dd
            className={cn(
              "font-semibold",
              node.active_alerts > 0 ? "text-amber-600" : "text-emerald-600"
            )}
          >
            {node.active_alerts}
          </dd>
        </div>
      </dl>
    </div>
  );
}

function MapLegend() {
  return (
    <div className="flex flex-wrap items-center gap-4 rounded-lg border border-border/60 bg-background/80 px-4 py-2.5 text-xs backdrop-blur-sm">
      <span className="font-semibold uppercase tracking-wider text-muted-foreground">Leyenda</span>
      {(Object.keys(STATUS_COLORS) as MapNodeStatus[]).map((status) => (
        <span key={status} className="inline-flex items-center gap-2">
          <span
            className="h-3 w-3 rounded-full shadow-sm"
            style={{
              backgroundColor: STATUS_COLORS[status],
              border: status === "DOWN" ? "1px solid #94a3b8" : undefined,
            }}
          />
          <span className="text-muted-foreground">{STATUS_LABELS[status]}</span>
          <span className="font-mono text-[10px] text-muted-foreground/70">({status})</span>
        </span>
      ))}
    </div>
  );
}

export function BoliviaClusterMap() {
  const { data: nodes = [], isLoading, isError, error, refetch, isFetching } = useMapNodes();
  const [statusFilter, setStatusFilter] = useState<MapNodeStatus | "ALL">("ALL");

  const filteredNodes = useMemo(() => {
    if (statusFilter === "ALL") return nodes;
    return nodes.filter((n) => n.status === statusFilter);
  }, [nodes, statusFilter]);

  const statusCounts = useMemo(() => {
    const counts: Record<MapNodeStatus | "ALL", number> = {
      ALL: nodes.length,
      UP: 0,
      WARNING: 0,
      CRITICAL: 0,
      DOWN: 0,
    };
    for (const node of nodes) {
      counts[node.status] += 1;
    }
    return counts;
  }, [nodes]);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="space-y-4 border-b border-border/40 bg-muted/20 pb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-cyan-400" />
              Mapa del Storage Cluster
            </CardTitle>
            <CardDescription className="mt-1">
              Estado geográfico de los nodos de almacenamiento
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="shrink-0"
          >
            <RefreshCw className={cn("mr-2 h-4 w-4", isFetching && "animate-spin")} />
            Actualizar
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {FILTER_OPTIONS.map((opt) => (
            <Button
              key={opt.value}
              variant={statusFilter === opt.value ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(opt.value)}
              className="h-8"
            >
              {opt.label}
              <Badge
                variant="secondary"
                className="ml-2 h-5 min-w-[1.25rem] px-1.5 font-mono text-[10px]"
              >
                {statusCounts[opt.value]}
              </Badge>
            </Button>
          ))}
        </div>

        <MapLegend />
      </CardHeader>

      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-6">
            <Skeleton className="h-[500px] w-full rounded-lg" />
          </div>
        ) : isError ? (
          <div className="flex h-[500px] flex-col items-center justify-center gap-4 p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-400" />
            <div>
              <p className="font-semibold text-red-400">Error al cargar el mapa</p>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                {error instanceof Error ? error.message : "No se pudieron obtener los nodos del cluster"}
              </p>
            </div>
            <Button variant="outline" onClick={() => refetch()}>
              Reintentar
            </Button>
          </div>
        ) : filteredNodes.length === 0 ? (
          <div className="flex h-[500px] flex-col items-center justify-center gap-3 p-8 text-center">
            <MapPin className="h-10 w-10 text-muted-foreground/50" />
            <p className="font-medium text-muted-foreground">
              {nodes.length === 0
                ? "No hay nodos registrados en el cluster"
                : `No hay nodos con estado ${statusFilter}`}
            </p>
            {nodes.length > 0 && statusFilter !== "ALL" && (
              <Button variant="ghost" size="sm" onClick={() => setStatusFilter("ALL")}>
                Ver todos los nodos
              </Button>
            )}
          </div>
        ) : (
          <div className="relative h-[500px] w-full overflow-hidden rounded-b-xl [&_.leaflet-container]:h-full [&_.leaflet-container]:w-full [&_.leaflet-container]:rounded-b-xl [&_.leaflet-popup-content-wrapper]:rounded-lg [&_.leaflet-popup-content]:m-0 [&_.leaflet-popup-content]:p-3">
            <MapContainer
              center={BOLIVIA_CENTER}
              zoom={INITIAL_ZOOM}
              scrollWheelZoom
              className="z-0 h-full w-full"
            >
              <MapResizeHandler />
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {filteredNodes.map((node) => (
                <Marker
                  key={node.id}
                  position={[node.latitude, node.longitude]}
                  icon={createStatusIcon(node.status)}
                >
                  <Popup>
                    <NodePopup node={node} />
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
            {isFetching && !isLoading && (
              <div className="pointer-events-none absolute right-3 top-3 z-[1000] rounded-md border border-cyan-500/30 bg-background/90 px-2 py-1 text-xs text-cyan-400 backdrop-blur-sm">
                Actualizando…
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
