import { cn, formatBytes } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  variant?: "default" | "success" | "warning" | "danger";
}

const variantStyles = {
  default: "text-primary",
  success: "text-green-600",
  warning: "text-yellow-600",
  danger: "text-red-600",
};

export function StatCard({ title, value, subtitle, icon: Icon, variant = "default" }: StatCardProps) {
  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <Icon className={cn("h-5 w-5", variantStyles[variant])} />
      </div>
      <p className="mt-2 text-2xl font-bold">{value}</p>
      {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

export function StatCardBytes({
  title,
  bytes,
  icon,
  variant = "default",
}: {
  title: string;
  bytes: number;
  icon: LucideIcon;
  variant?: StatCardProps["variant"];
}) {
  return <StatCard title={title} value={formatBytes(bytes)} icon={icon} variant={variant} />;
}
