"use client";

import { Activity, Bell } from "lucide-react";

export function TopBar() {
  const now = new Date().toLocaleString("es-BO", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-white/5 bg-background/60 px-6 backdrop-blur-xl lg:px-10">
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <Activity className="h-4 w-4 text-cyan-400" />
        <span>Monitoreo en tiempo real</span>
        <span className="hidden text-white/20 sm:inline">|</span>
        <span className="hidden font-mono text-xs sm:inline">{now}</span>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-muted-foreground transition-colors hover:border-cyan-500/30 hover:text-cyan-400"
          aria-label="Notificaciones"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
            !
          </span>
        </button>
        <div className="hidden items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 sm:flex">
          <span className="live-pulse h-2 w-2 rounded-full bg-emerald-400" />
          <span className="text-xs font-medium text-emerald-400">Live</span>
        </div>
      </div>
    </header>
  );
}
