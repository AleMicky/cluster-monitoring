import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<string, { dot: string; bg: string; text: string; label?: string }> = {
  UP: { dot: "bg-emerald-400", bg: "bg-emerald-500/15", text: "text-emerald-400", label: "Activo" },
  DOWN: { dot: "bg-red-400", bg: "bg-red-500/15", text: "text-red-400", label: "Caído" },
  ACTIVE: { dot: "bg-amber-400", bg: "bg-amber-500/15", text: "text-amber-400", label: "Activa" },
  RESOLVED: { dot: "bg-slate-400", bg: "bg-slate-500/15", text: "text-slate-400", label: "Resuelta" },
  HEALTHY: { dot: "bg-emerald-400", bg: "bg-emerald-500/15", text: "text-emerald-400", label: "Saludable" },
  WARNING: { dot: "bg-amber-400", bg: "bg-amber-500/15", text: "text-amber-400" },
  CRITICAL: { dot: "bg-red-400", bg: "bg-red-500/15", text: "text-red-400" },
  INFO: { dot: "bg-blue-400", bg: "bg-blue-500/15", text: "text-blue-400" },
};

interface StatusBadgeProps {
  value: string;
  className?: string;
  showDot?: boolean;
}

export function StatusBadge({ value, className, showDot = true }: StatusBadgeProps) {
  const config = STATUS_CONFIG[value] || {
    dot: "bg-slate-400",
    bg: "bg-slate-500/15",
    text: "text-slate-400",
  };
  const label = config.label || value;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-white/5 px-2.5 py-1 text-xs font-semibold",
        config.bg,
        config.text,
        className
      )}
    >
      {showDot && (
        <span className={cn("h-1.5 w-1.5 rounded-full shadow-[0_0_6px_1px]", config.dot)} />
      )}
      {label}
    </span>
  );
}
