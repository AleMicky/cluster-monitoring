"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  actions?: React.ReactNode;
  badge?: string;
}

export function PageHeader({
  title,
  description,
  onRefresh,
  isRefreshing,
  actions,
  badge,
}: PageHeaderProps) {
  return (
    <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-2">
        {badge && (
          <span className="inline-flex items-center rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-0.5 text-xs font-medium text-cyan-400">
            {badge}
          </span>
        )}
        <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">
          <span className="gradient-text">{title}</span>
        </h1>
        {description && (
          <p className="max-w-2xl text-base text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {onRefresh && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="border-white/10 bg-white/5 hover:border-cyan-500/30 hover:bg-cyan-500/10 hover:text-cyan-300"
          >
            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
            Actualizar
          </Button>
        )}
        {actions}
      </div>
    </div>
  );
}
