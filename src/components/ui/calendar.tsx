"use client";

import * as React from "react";
import { DayPicker, getDefaultClassNames } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
};

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  locale,
  formatters,
  components,
  ...props
}: CalendarProps) {
  const defaultClassNames = getDefaultClassNames();

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("bg-card p-3", className)}
      captionLayout={captionLayout}
      locale={locale}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString(locale?.code, { month: "short" }),
        ...formatters,
      }}
      classNames={{
        root: cn("w-fit", defaultClassNames.root),
        months: cn("relative flex flex-col gap-4 md:flex-row", defaultClassNames.months),
        month: cn("flex w-full flex-col gap-4", defaultClassNames.month),
        nav: cn(
          "absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1",
          defaultClassNames.nav
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          "h-7 w-7 p-0 select-none aria-disabled:opacity-50",
          defaultClassNames.button_previous
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          "h-7 w-7 p-0 select-none aria-disabled:opacity-50",
          defaultClassNames.button_next
        ),
        month_caption: cn(
          "flex h-7 w-full items-center justify-center px-7 text-sm font-semibold text-foreground",
          defaultClassNames.month_caption
        ),
        dropdowns: cn(
          "flex h-7 w-full items-center justify-center gap-1.5 text-sm font-medium",
          defaultClassNames.dropdowns
        ),
        dropdown_root: cn("relative rounded-md", defaultClassNames.dropdown_root),
        dropdown: cn("absolute inset-0 bg-popover opacity-0", defaultClassNames.dropdown),
        caption_label: cn("font-semibold select-none text-sm text-foreground", defaultClassNames.caption_label),
        month_grid: cn("w-full border-collapse", defaultClassNames.month_grid),
        weekdays: cn("flex", defaultClassNames.weekdays),
        weekday: cn(
          "flex-1 rounded-md text-[0.8rem] font-medium text-muted-foreground select-none text-center",
          defaultClassNames.weekday
        ),
        week: cn("mt-2 flex w-full", defaultClassNames.week),
        week_number_header: cn("w-8 select-none", defaultClassNames.week_number_header),
        week_number: cn(
          "text-[0.8rem] text-muted-foreground select-none",
          defaultClassNames.week_number
        ),
        day: cn(
          "group/day relative aspect-square h-8 w-8 rounded-lg p-0 text-center select-none",
          defaultClassNames.day
        ),
        range_start: cn(
          "relative isolate z-0 rounded-l-lg bg-primary/10 text-primary after:absolute after:inset-y-0 after:right-0 after:w-4 after:bg-primary/10",
          defaultClassNames.range_start
        ),
        range_middle: cn("rounded-none bg-primary/10 text-primary", defaultClassNames.range_middle),
        range_end: cn(
          "relative isolate z-0 rounded-r-lg bg-primary/10 text-primary after:absolute after:inset-y-0 after:left-0 after:w-4 after:bg-primary/10",
          defaultClassNames.range_end
        ),
        today: cn(
          "rounded-lg bg-muted text-foreground font-bold",
          defaultClassNames.today
        ),
        outside: cn(
          "text-muted-foreground opacity-40 aria-selected:text-muted-foreground",
          defaultClassNames.outside
        ),
        disabled: cn("text-muted-foreground opacity-30 cursor-not-allowed", defaultClassNames.disabled),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className: rootCls, rootRef, ...rootProps }: any) => (
          <div data-slot="calendar" ref={rootRef} className={cn(rootCls)} {...rootProps} />
        ),
        Chevron: ({ className: chvCls, orientation, ...chevronProps }: any) => {
          if (orientation === "left") {
            return <ChevronLeft className={cn("h-4 w-4", chvCls)} {...chevronProps} />;
          }
          if (orientation === "right") {
            return <ChevronRight className={cn("h-4 w-4", chvCls)} {...chevronProps} />;
          }
          return <ChevronDown className={cn("h-4 w-4", chvCls)} {...chevronProps} />;
        },
        DayButton: (btnProps: any) => (
          <CalendarDayButton locale={locale} {...btnProps} />
        ),
        ...components,
      }}
      {...props}
    />
  );
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  locale,
  ...props
}: any) {
  const defaultClassNames = getDefaultClassNames();
  const ref = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString(locale?.code)}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        "relative isolate z-10 flex aspect-square h-8 w-8 flex-col items-center justify-center border-0 p-0 text-xs font-normal leading-none transition-colors",
        "data-[range-start=true]:rounded-l-lg data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[range-start=true]:font-semibold",
        "data-[range-end=true]:rounded-r-lg data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground data-[range-end=true]:font-semibold",
        "data-[range-middle=true]:rounded-none data-[range-middle=true]:bg-primary/10 data-[range-middle=true]:text-foreground",
        "data-[selected-single=true]:rounded-lg data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground data-[selected-single=true]:font-semibold",
        "hover:bg-primary/20 hover:text-foreground",
        defaultClassNames.day,
        className
      )}
      {...props}
    />
  );
}
