"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Activity,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { cn } from "@/lib/utils";
import { authService } from "@/services/authService";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { analyticsService } from "@/services/analyticsService";

export function Sidebar({
  collapsed,
  setCollapsed,
}: {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}) {
  const pathname = usePathname();
  const router = useRouter();

  // Query analytics overview to show dynamic count badges in the sidebar
  const { data: analytics } = useQuery({
    queryKey: ["analytics-overview"],
    queryFn: () => analyticsService.getOverview(),
  });

  const totalDoctors = analytics?.data?.summary?.totalDoctors ?? 0;
  const totalPatients = analytics?.data?.summary?.totalPatients ?? 0;

  const navItems = [
    {
      label: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
      active: pathname === "/",
    },
    {
      label: "Doctors",
      href: "/doctors",
      icon: Users,
      badge: totalDoctors > 0 ? totalDoctors : undefined,
      active: pathname.startsWith("/doctors"),
    },
    {
      label: "Patients",
      href: "/patients",
      icon: Activity,
      badge: totalPatients > 0 ? totalPatients : undefined,
      active: pathname.startsWith("/patients"),
    },
  ];

  const handleLogout = async () => {
    try {
      await authService.logout();
      toast.success("Signed out successfully");
      window.location.href = "/login";
    } catch {
      toast.error("Failed to sign out");
    }
  };

  return (
    <aside
      className={cn(
        "relative flex flex-col border-r border-border bg-card transition-all duration-300 z-30 select-none",
        collapsed ? "w-[68px]" : "w-[240px]"
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 shrink-0 items-center border-b border-border px-4">
        <Link href="/" className="overflow-hidden">
          <Logo collapsed={collapsed} />
        </Link>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          {!collapsed && "Platform"}
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all",
                item.active
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className={cn("h-4 w-4 shrink-0 stroke-[2.2]", item.active ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")} />
              {!collapsed && (
                <div className="flex flex-1 items-center justify-between">
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.2 text-[10px] font-bold tabular-nums",
                        item.active
                          ? "bg-primary-foreground/20 text-primary-foreground"
                          : "bg-muted text-foreground border border-border"
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {/* Footer / User & Sidebar Collapse */}
      <div className="border-t border-border p-3 space-y-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors",
            collapsed && "justify-center"
          )}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronLeft className="h-4 w-4 shrink-0 text-muted-foreground" />
          )}
          {!collapsed && <span>Collapse sidebar</span>}
        </button>

        <div className="flex items-center justify-between gap-2 rounded-xl bg-surface-inset/60 p-2 border border-border/50">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-primary/20 text-primary font-bold text-xs">
              AD
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1 leading-tight">
                <div className="truncate text-xs font-semibold text-foreground flex items-center gap-1">
                  <span>Admin</span>
                  <ShieldCheck className="h-3 w-3 text-primary inline" />
                </div>
                <div className="truncate text-[10px] text-muted-foreground">admin@doctortracker.com</div>
              </div>
            )}
          </div>
          {!collapsed && (
            <button
              onClick={handleLogout}
              className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              title="Sign out"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
