import React from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function TableShell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("w-full overflow-x-auto", className)}>
      <table className="w-full text-left text-xs text-foreground border-collapse">{children}</table>
    </div>
  );
}

export function Thead({ children }: { children: React.ReactNode }) {
  return <thead className="border-b border-border bg-muted/30 text-muted-foreground">{children}</thead>;
}

export interface ThProps {
  children?: React.ReactNode;
  align?: "left" | "right" | "center";
  className?: string;
  sortable?: boolean;
  sorted?: "asc" | "desc" | false;
  onSort?: () => void;
}

export function Th({
  children,
  align = "left",
  className,
  sortable = false,
  sorted = false,
  onSort,
}: ThProps) {
  const alignCls = align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left";

  if (sortable && onSort) {
    return (
      <th
        onClick={onSort}
        className={cn(
          "whitespace-nowrap px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground select-none cursor-pointer transition-colors hover:text-foreground hover:bg-muted/50",
          alignCls,
          className
        )}
      >
        <div className={cn("inline-flex items-center gap-1.5", align === "right" && "justify-end")}>
          <span>{children}</span>
          {sorted === "asc" ? (
            <ArrowUp className="h-3.5 w-3.5 text-primary stroke-[2.5]" />
          ) : sorted === "desc" ? (
            <ArrowDown className="h-3.5 w-3.5 text-primary stroke-[2.5]" />
          ) : (
            <ArrowUpDown className="h-3.5 w-3.5 opacity-40 hover:opacity-100" />
          )}
        </div>
      </th>
    );
  }

  return (
    <th
      className={cn(
        "whitespace-nowrap px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground",
        alignCls,
        className
      )}
    >
      {children}
    </th>
  );
}

export function Td({
  children,
  align = "left",
  className,
}: {
  children?: React.ReactNode;
  align?: "left" | "right" | "center";
  className?: string;
}) {
  const alignCls = align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left";
  return (
    <td className={cn("px-4 py-3.5 text-xs text-foreground align-middle", alignCls, className)}>
      {children}
    </td>
  );
}

export function Tr({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <tr
      onClick={onClick}
      className={cn(
        "border-b border-border/60 transition-colors hover:bg-muted/40 last:border-0",
        onClick && "cursor-pointer",
        className
      )}
    >
      {children}
    </tr>
  );
}

export function MiniBar({
  value,
  max,
  className,
}: {
  value: number;
  max: number;
  className?: string;
}) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
        {value}
      </span>
    </div>
  );
}

export function AdminPanel({
  title,
  description,
  action,
  children,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("surface-card overflow-hidden", className)}>
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border p-4 sm:p-5">
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-foreground">{title}</h2>
          {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
        </div>
        {action}
      </div>
      <div>{children}</div>
    </section>
  );
}
