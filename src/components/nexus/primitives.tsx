import React from 'react';
import Link from 'next/link';
import { ArrowLeft, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PageHeaderProps {
  backHref?: string;
  backLabel?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  icon?: LucideIcon;
  meta?: React.ReactNode;
}

export function PageHeader({
  backHref,
  backLabel,
  eyebrow,
  title,
  description,
  actions,
  icon: Icon,
  meta,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 border-b border-border bg-card/40 px-4 py-5 backdrop-blur-xs sm:flex-row sm:items-center sm:justify-between md:px-8">
      <div className="flex min-w-0 flex-col gap-1.5">
        {backHref && (
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground mb-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {backLabel || 'Back'}
          </Link>
        )}
        <div className="flex min-w-0 items-center gap-3.5">
          {Icon && (
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-xs">
              <Icon className="h-5 w-5" />
            </div>
          )}
          <div className="min-w-0">
            {eyebrow && (
              <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
                {eyebrow}
              </div>
            )}
            <h1 className="text-xl font-semibold leading-tight tracking-tight text-foreground sm:text-2xl sm:truncate">
              {title}
            </h1>
            {description && (
              <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
      </div>
      {(actions || meta) && (
        <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
          {actions}
          {meta && <div className="text-[11px] text-muted-foreground">{meta}</div>}
        </div>
      )}
    </div>
  );
}

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[260px] flex-col items-center justify-center rounded-xl border border-dashed border-border p-8 text-center",
        className
      )}
    >
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-muted text-muted-foreground">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-3.5 text-sm font-semibold tracking-tight text-foreground">
        {title}
      </h3>
      {description && (
        <p className="mt-1 max-w-sm text-xs text-muted-foreground">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
      {children}
    </div>
  );
}
