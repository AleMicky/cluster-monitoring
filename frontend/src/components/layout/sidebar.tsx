"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AlertTriangle,
  HardDrive,
  LayoutDashboard,
  Server,
  Settings,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/nodes", label: "Nodos", icon: Server },
  { href: "/alerts", label: "Alertas", icon: AlertTriangle },
  { href: "/settings", label: "Configuración", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="relative flex w-[280px] flex-col border-r border-white/5 bg-sidebar">
      <div className="absolute inset-0 bg-mesh-gradient opacity-50" />
      <div className="relative flex h-[72px] items-center gap-3 border-b border-white/5 px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 shadow-lg shadow-cyan-500/25">
          <HardDrive className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold tracking-tight text-white">Storage Cluster</p>
          <p className="flex items-center gap-1 text-[11px] text-cyan-400/90">
            <Sparkles className="h-3 w-3" />
            Enterprise Monitoring
          </p>
        </div>
      </div>

      <nav className="relative flex flex-1 flex-col gap-1.5 p-4">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Navegación
        </p>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                active
                  ? "nav-active-glow bg-gradient-to-r from-cyan-500/20 to-teal-500/10 text-cyan-300"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
              )}
            >
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                  active
                    ? "bg-cyan-500/20 text-cyan-400"
                    : "bg-white/5 text-muted-foreground group-hover:bg-white/10 group-hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
              </span>
              {label}
              {active && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_2px] shadow-cyan-400/60" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="relative border-t border-white/5 p-4">
        <div className="rounded-lg border border-white/5 bg-white/5 p-3 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <span className="live-pulse h-2 w-2 rounded-full bg-emerald-400" />
            <span className="text-xs font-medium text-emerald-400">Cluster operativo</span>
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
            9 departamentos · Infraestructura nacional Bolivia
          </p>
        </div>
      </div>
    </aside>
  );
}
