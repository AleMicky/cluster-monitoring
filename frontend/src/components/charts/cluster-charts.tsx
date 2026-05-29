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
import { CHART_COLORS } from "@/lib/utils";
import type { DepartmentCapacity, NodeStatusSummary } from "@/types";

const tooltipStyle = {
  contentStyle: {
    backgroundColor: "hsl(222 47% 9%)",
    border: "1px solid hsl(217 33% 18%)",
    borderRadius: "8px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.4)",
  },
  labelStyle: { color: "hsl(210 40% 98%)" },
  itemStyle: { color: "hsl(215 20% 70%)" },
};

export function CapacityByDepartmentChart({ data }: { data: DepartmentCapacity[] }) {
  const chartData = data.map((d) => ({
    name: d.department.length > 10 ? d.department.slice(0, 8) + "…" : d.department,
    fullName: d.department,
    usado: Math.round((d.used_capacity_bytes / 1024 ** 4) * 100) / 100,
    total: Math.round((d.total_capacity_bytes / 1024 ** 4) * 100) / 100,
    usage: d.usage_percent,
  }));

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Capacidad por departamento</CardTitle>
        <CardDescription>Distribución regional del almacenamiento (TB)</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={340}>
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 60 }}>
            <defs>
              <linearGradient id="barUsed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#0891b2" />
              </linearGradient>
              <linearGradient id="barTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#475569" />
                <stop offset="100%" stopColor="#334155" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 18%)" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: "hsl(215 20% 58%)" }}
              angle={-35}
              textAnchor="end"
              height={70}
            />
            <YAxis tick={{ fontSize: 11, fill: "hsl(215 20% 58%)" }} unit=" TB" />
            <Tooltip
              {...tooltipStyle}
              formatter={(value: number, name: string) => [
                `${value} TB`,
                name === "usado" ? "Usado" : "Total",
              ]}
            />
            <Legend
              formatter={(v) => (v === "usado" ? "Usado" : "Total")}
              wrapperStyle={{ paddingTop: 16 }}
            />
            <Bar dataKey="total" fill="url(#barTotal)" radius={[6, 6, 0, 0]} maxBarSize={40} />
            <Bar dataKey="usado" fill="url(#barUsed)" radius={[6, 6, 0, 0]} maxBarSize={40} />
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
    { name: "Activos", value: up, color: "#34d399" },
    { name: "Caídos", value: down, color: "#f87171" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estado del cluster</CardTitle>
        <CardDescription>
          <span className="text-emerald-400">{up} activos</span>
          {" · "}
          <span className={down > 0 ? "text-red-400" : "text-muted-foreground"}>{down} caídos</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={110}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
              label={({ name, value, percent }) =>
                `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
              }
              labelLine={{ stroke: "hsl(215 20% 40%)" }}
            >
              {pieData.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip {...tooltipStyle} />
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
        <CardTitle>Uso de disco</CardTitle>
        <CardDescription>Porcentaje por dispositivo</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 18%)" horizontal={false} />
            <XAxis
              type="number"
              domain={[0, 100]}
              unit="%"
              tick={{ fill: "hsl(215 20% 58%)" }}
            />
            <YAxis
              type="category"
              dataKey="label"
              width={72}
              tick={{ fontSize: 12, fill: "hsl(215 20% 58%)" }}
            />
            <Tooltip {...tooltipStyle} formatter={(v: number) => [`${v.toFixed(1)}%`, "Uso"]} />
            <Bar dataKey="usage" radius={[0, 6, 6, 0]} maxBarSize={28}>
              {data.map((entry, index) => (
                <Cell
                  key={index}
                  fill={
                    entry.usage >= 90
                      ? "#f87171"
                      : entry.usage >= 80
                        ? "#fbbf24"
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
        <CardTitle>Historial de métricas</CardTitle>
        <CardDescription>CPU, memoria y disco — últimas 24 h</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.slice(0, 12).reverse()} margin={{ top: 5, right: 5, left: -15 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 18%)" vertical={false} />
            <XAxis dataKey="time" tick={{ fontSize: 10, fill: "hsl(215 20% 58%)" }} />
            <YAxis domain={[0, 100]} unit="%" tick={{ fill: "hsl(215 20% 58%)" }} />
            <Tooltip {...tooltipStyle} formatter={(v: number) => [`${v.toFixed(1)}%`]} />
            <Legend />
            <Bar dataKey="cpu" name="CPU" fill="#22d3ee" radius={[4, 4, 0, 0]} maxBarSize={20} />
            <Bar dataKey="memory" name="Memoria" fill="#34d399" radius={[4, 4, 0, 0]} maxBarSize={20} />
            <Bar dataKey="disk" name="Disco" fill="#a78bfa" radius={[4, 4, 0, 0]} maxBarSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
