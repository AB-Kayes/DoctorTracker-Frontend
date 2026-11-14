import React from "react";
import { Activity } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ className, collapsed = false }: { className?: string; collapsed?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2.5 select-none", className)}>
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
        <Activity className="h-5 w-5 stroke-[2.5]" />
      </div>
      {!collapsed && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-sm tracking-tight text-foreground">
              Doctor<span className="text-primary font-bold">Tracker</span>
            </span>
            <span className="rounded-sm bg-primary/10 px-1 py-0.2 text-[9px] font-bold uppercase tracking-wider text-primary border border-primary/20">
              Admin
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground font-medium mt-0.5">
            Clinical Management
          </span>
        </div>
      )}
    </div>
  );
}
