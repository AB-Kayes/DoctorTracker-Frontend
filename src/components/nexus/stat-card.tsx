"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowDownRight, ArrowUpRight, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StatCardProps {
  label: string;
  value: number | string;
  trend?: number;
  icon?: LucideIcon;
  accent?: 'primary' | 'success' | 'warning' | 'destructive' | 'info';
  secondaryValue?: number | string;
  secondaryLabel?: string;
  description?: string;
}

const chipMap = {
  primary: 'bg-primary/10 text-primary border border-primary/20',
  success: 'bg-success/10 text-success border border-success/20',
  warning: 'bg-warning/10 text-warning border border-warning/20',
  destructive: 'bg-destructive/10 text-destructive border border-destructive/20',
  info: 'bg-info/10 text-info border border-info/20',
};

export function StatCard({
  label,
  value,
  trend,
  icon: Icon,
  accent = 'primary',
  secondaryValue,
  secondaryLabel,
  description,
}: StatCardProps) {
  const trendUp = (trend ?? 0) >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="surface-card flex flex-col justify-between h-full p-5 sm:p-6 min-h-[145px]"
    >
      {/* Top Header Row: Label & Chip Icon */}
      <div>
        <div className="flex items-center justify-between gap-2.5">
          <span className="text-xs font-semibold text-muted-foreground truncate">{label}</span>
          {Icon && (
            <div className={cn('grid h-8 w-8 place-items-center rounded-xl shrink-0', chipMap[accent])}>
              <Icon className="h-4 w-4" />
            </div>
          )}
        </div>

        {/* Primary Metric Value */}
        <div className="mt-2.5">
          <div className="text-2xl font-bold tracking-tight tabular-nums text-foreground sm:text-3xl">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </div>
        </div>
      </div>

      {/* Structured Footer: Maintains exact baseline across all 4 cards in a row */}
      <div className="mt-3 pt-2 border-t border-border/40 min-h-[26px] flex items-center justify-between text-xs">
        {trend !== undefined ? (
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                'inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[11px] font-semibold',
                trendUp ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
              )}
            >
              {trendUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {Math.abs(trend)}%
            </span>
            <span className="text-[11px] text-muted-foreground">vs last month</span>
          </div>
        ) : description ? (
          <span className="text-[11px] text-muted-foreground truncate leading-none">
            {description}
          </span>
        ) : secondaryValue !== undefined ? (
          <span className="text-[11px] text-muted-foreground leading-none">
            <strong className="text-foreground">{secondaryValue}</strong> {secondaryLabel}
          </span>
        ) : (
          <span className="text-[11px] text-muted-foreground/40 leading-none">
            Active in portal
          </span>
        )}
      </div>
    </motion.div>
  );
}
