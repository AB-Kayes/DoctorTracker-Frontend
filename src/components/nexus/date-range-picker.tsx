"use client";

import React, { useMemo, useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

export interface DateRange {
  from?: Date;
  to?: Date;
  preset?: string;
}

export const PRESETS = [
  { value: "all", label: "All time" },
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "ytd", label: "Year to date" },
  { value: "1y", label: "Last 1 year" },
  { value: "custom", label: "Custom range" },
];

export function resolvePreset(preset: string): { from?: Date; to?: Date } {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);

  switch (preset) {
    case "all":
      return { from: undefined, to: undefined };
    case "today":
      return { from: startOfDay(now), to: end };
    case "yesterday": {
      const y = new Date(now);
      y.setDate(now.getDate() - 1);
      return { from: startOfDay(y), to: new Date(y.getFullYear(), y.getMonth(), y.getDate(), 23, 59, 59, 999) };
    }
    case "7d": {
      const d = new Date(now);
      d.setDate(now.getDate() - 6);
      return { from: startOfDay(d), to: end };
    }
    case "30d": {
      const d = new Date(now);
      d.setDate(now.getDate() - 29);
      return { from: startOfDay(d), to: end };
    }
    case "90d": {
      const d = new Date(now);
      d.setDate(now.getDate() - 89);
      return { from: startOfDay(d), to: end };
    }
    case "ytd":
      return { from: new Date(now.getFullYear(), 0, 1), to: end };
    case "1y": {
      const d = new Date(now);
      d.setFullYear(now.getFullYear() - 1);
      return { from: startOfDay(d), to: end };
    }
    default:
      return { from: undefined, to: undefined };
  }
}

export function defaultRange(): DateRange {
  return { ...resolvePreset("30d"), preset: "30d" };
}

export interface DateRangePickerProps {
  value?: DateRange;
  onChange: (range: DateRange) => void;
  className?: string;
  placeholder?: string;
}

export function DateRangePicker({
  value,
  onChange,
  className,
  placeholder = "Filter by date",
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [showCustom, setShowCustom] = useState(value?.preset === "custom");
  const [customRange, setCustomRange] = useState<{ from?: Date; to?: Date } | undefined>(
    value?.preset === "custom" && value.from && value.to
      ? { from: new Date(value.from), to: new Date(value.to) }
      : undefined
  );
  const isMobile = useIsMobile();

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) {
      setShowCustom(value?.preset === "custom");
      if (value?.preset === "custom" && value.from && value.to) {
        setCustomRange({ from: new Date(value.from), to: new Date(value.to) });
      }
    }
  };

  const label = useMemo(() => {
    if (!value || value.preset === "all" || (!value.preset && !value.from && !value.to)) {
      return "All time";
    }
    if (value.preset && value.preset !== "custom") {
      return PRESETS.find((p) => p.value === value.preset)?.label ?? "Range";
    }
    if (value.from && value.to) {
      return `${format(new Date(value.from), "MMM d, yyyy")} – ${format(new Date(value.to), "MMM d, yyyy")}`;
    }
    return placeholder;
  }, [value, placeholder]);

  const choosePreset = (p: string) => {
    if (p === "custom") {
      setShowCustom(true);
      return;
    }
    const r = resolvePreset(p);
    onChange({ ...r, preset: p });
    setShowCustom(false);
    setOpen(false);
  };

  const applyCustom = () => {
    if (customRange?.from && customRange?.to) {
      onChange({
        from: customRange.from,
        to: new Date(customRange.to.getFullYear(), customRange.to.getMonth(), customRange.to.getDate(), 23, 59, 59, 999),
        preset: "custom",
      });
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-9 justify-start gap-2 font-normal text-xs max-w-full border-border bg-card shadow-xs hover:bg-muted/60 transition-colors",
            className
          )}
        >
          <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span className="font-medium text-foreground truncate">{label}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className={cn(
          "w-auto p-0 border border-border bg-card shadow-2xl rounded-2xl overflow-hidden z-[110]",
          "flex flex-col sm:flex-row"
        )}
      >
        {/* Preset list on the left */}
        <div
          className={cn(
            "border-b sm:border-b-0 sm:border-r border-border p-2 bg-muted/20 min-w-[140px]",
            "grid grid-cols-2 gap-1 sm:grid-cols-1"
          )}
        >
          {PRESETS.map((p) => {
            const active =
              p.value === "custom"
                ? showCustom
                : p.value === (value?.preset || "all") && !showCustom;
            return (
              <button
                key={p.value}
                type="button"
                onClick={() => choosePreset(p.value)}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                    : "text-foreground hover:bg-muted"
                )}
              >
                <span>{p.label}</span>
                {active && <Check className="h-3 w-3 shrink-0 ml-1.5" />}
              </button>
            );
          })}
        </div>

        {/* Custom Calendar area on the right */}
        {showCustom && (
          <div className="flex flex-col p-3 bg-card sm:min-w-[320px]">
            <Calendar
              mode="range"
              selected={customRange as any}
              onSelect={setCustomRange as any}
              numberOfMonths={isMobile ? 1 : 2}
            />
            <div className="mt-3 flex items-center justify-between gap-3 border-t border-border pt-3">
              <div className="text-[11px] text-muted-foreground truncate">
                {customRange?.from && customRange?.to
                  ? `${format(customRange.from, "MMM d")} – ${format(customRange.to, "MMM d, yyyy")}`
                  : "Select start and end date"}
              </div>
              <Button
                size="sm"
                onClick={applyCustom}
                disabled={!customRange?.from || !customRange?.to}
                className="h-8 px-3 text-xs shadow-xs"
              >
                Apply Range
              </Button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
