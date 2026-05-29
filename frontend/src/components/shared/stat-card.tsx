import { cn, formatBytes } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  variant?: "default" | "success" | "warning" | "danger" | "info";
  trend?: string;
}

const variantConfig = {
  default: {
    iconBg: "bg-cyan-500/15",
    iconColor: "text-cyan-400",
    accent: "from-cyan-500/20 to-transparent",
    glow: "stat-glow",
  },
  success: {
    iconBg: "bg-emerald-500/15",
    iconColor: "text-emerald-400",
    accent: "from-emerald-500/20 to-transparent",
    glow: "",
  },
  warning: {
    iconBg: "bg-amber-500/15",
    iconColor: "text-amber-400",
    accent: "from-amber-500/20 to-transparent",
    glow: "",
  },
  danger: {
    iconBg: "bg-red-500/15",
    iconColor: "text-red-400",
    accent: "from-red-500/20 to-transparent",
    glow: "",
  },
  info: {
    iconBg: "bg-violet-500/15",
    iconColor: "text-violet-400",
    accent: "from-violet-500/20 to-transparent",
    glow: "",
  },
};

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = "default",
  trend,
}: StatCardProps) {
  const config = variantConfig[variant];

  return (
    <div
      className={cn(
        "glass-panel-hover group relative overflow-hidden p-6",
        variant === "default" && config.glow
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-60",
          config.accent
        )}
      />
      <div className="relative">
        <div className="flex items-start justify-between">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl transition-transform group-hover:scale-105",
              config.iconBg
            )}
          >
            <Icon className={cn("h-5 w-5", config.iconColor)} />
          </div>
        </div>
        <p className="mt-3 font-mono text-3xl font-bold tracking-tight text-foreground">{value}</p>
        {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
        {trend && (
          <p className="mt-2 text-xs font-medium text-cyan-400/80">{trend}</p>
        )}
      </div>
    </div>
  );
}

export function StatCardBytes({
  title,
  bytes,
  icon,
  variant = "default",
  subtitle,
}: {
  title: string;
  bytes: number;
  icon: LucideIcon;
  variant?: StatCardProps["variant"];
  subtitle?: string;
}) {
  return (
    <StatCard
      title={title}
      value={formatBytes(bytes)}
      icon={icon}
      variant={variant}
      subtitle={subtitle}
    />
  );
}
