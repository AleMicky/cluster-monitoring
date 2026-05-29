import { cn, STATUS_COLORS } from "@/lib/utils";

interface StatusBadgeProps {
  value: string;
  className?: string;
}

export function StatusBadge({ value, className }: StatusBadgeProps) {
  const colors = STATUS_COLORS[value] || "bg-gray-100 text-gray-800";
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold", colors, className)}>
      {value}
    </span>
  );
}
