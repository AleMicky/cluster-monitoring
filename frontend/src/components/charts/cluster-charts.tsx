"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CHART_COLORS, formatBytes } from "@/lib/utils";
import type { DepartmentCapacity, NodeStatusSummary } from "@/types";

export function CapacityByDepartmentChart({ data }: { data: DepartmentCapacity[] }) {
  const chartData = data.map((d) => ({
    name: d.department,
    usado: Math.round(d.used_capacity_bytes / 1024 ** 4 * 100) / 100,
    total: Math.round(d.total_capacity_bytes / 1024 ** 4 * 100) / 100,
    usage: d.usage_percent,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Capacidad por departamento</CardTitle>
        <CardDescription>Uso de almacenamiento en TB por región</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" height={70} />
            <YAxis tick={{ fontSize: 12 }} unit=" TB" />
            <Tooltip
              formatter={(value: number, name: string) => [
                `${value} TB`,
                name === "usado" ? "Usado" : "Total",
              ]}
            />
            <Legend formatter={(v) => (v === "usado" ? "Usado" : "Total")} />
            <Bar dataKey="total" fill="#94a3b8" radius={[4, 4, 0, 0]} />
            <Bar dataKey="usado" fill="#2563eb" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function NodeStatusChart({ data }: { data: NodeStatusSummary[] }) {
  const up = data.filter((n) => n.status === "UP").length;
  const down = data.filter((n) => n.status === "DOWN").length;
  const pieData = [
    { name: "Activos", value: up, color: "#16a34a" },
    { name: "Caídos", value: down, color: "#dc2626" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Estado de nodos</CardTitle>
        <CardDescription>
          {up} activos · {down} caídos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={4}
              dataKey="value"
              label={({ name, value }) => `${name}: ${value}`}
            >
              {pieData.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function DiskUsageChart({
  data,
}: {
  data: { label: string; usage: number }[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Uso de disco</CardTitle>
        <CardDescription>Porcentaje de uso por dispositivo</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis type="number" domain={[0, 100]} unit="%" />
            <YAxis type="category" dataKey="label" width={80} tick={{ fontSize: 12 }} />
            <Tooltip formatter={(v: number) => [`${v.toFixed(1)}%`, "Uso"]} />
            <Bar dataKey="usage" radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={index}
                  fill={
                    entry.usage >= 90
                      ? "#dc2626"
                      : entry.usage >= 80
                        ? "#ca8a04"
                        : CHART_COLORS[index % CHART_COLORS.length]
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function MetricsHistoryChart({
  data,
}: {
  data: { time: string; cpu: number; memory: number; disk: number }[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Historial de métricas</CardTitle>
        <CardDescription>CPU, memoria y disco (últimas 24 h)</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data.slice(0, 12).reverse()}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="time" tick={{ fontSize: 10 }} />
            <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 12 }} />
            <Tooltip formatter={(v: number) => [`${v.toFixed(1)}%`]} />
            <Legend />
            <Bar dataKey="cpu" name="CPU" fill="#2563eb" />
            <Bar dataKey="memory" name="Memoria" fill="#16a34a" />
            <Bar dataKey="disk" name="Disco" fill="#9333ea" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
