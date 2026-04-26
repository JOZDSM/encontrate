import * as React from "react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const captionLayout = props.captionLayout;
  const isDropdownCaption = Boolean(
    captionLayout && String(captionLayout).startsWith("dropdown"),
  );

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("relative w-full p-3", className)}
      classNames={{
        months: "flex w-full flex-col gap-4",
        month: "w-full space-y-4",
        month_caption:
          "grid grid-cols-[2rem_1fr_2rem] items-center pt-1 relative min-h-10 text-foreground",
        caption_label: cn("text-sm font-medium", isDropdownCaption && "hidden"),
        dropdowns:
          "col-start-2 flex items-center justify-center gap-2 justify-self-center",
        dropdown:
          "h-8 rounded-md border border-border bg-background px-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
        // Anchor chevrons to the calendar box (not the page).
        // DayPicker's nav can be rendered outside the caption in v9; positioning it at
        // the top within the calendar padding keeps it aligned with the dropdowns.
        nav: "contents",
        button_previous: cn(
          buttonVariants({ variant: "ghost" }),
          "col-start-1 size-8 p-0 text-foreground opacity-70 hover:opacity-100 justify-self-start",
        ),
        button_next: cn(
          buttonVariants({ variant: "ghost" }),
          "col-start-3 size-8 p-0 text-foreground opacity-70 hover:opacity-100 justify-self-end",
        ),
        month_grid: "w-full border-collapse",
        weekdays: "flex w-full justify-between",
        weekday:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] text-center",
        weeks: "flex w-full flex-col",
        week: "flex w-full justify-between mt-2",
        day: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "size-9 p-0 font-normal aria-selected:opacity-100",
        ),
        selected:
          "bg-accent text-accent-foreground hover:bg-accent hover:text-accent-foreground",
        today: "bg-muted text-foreground",
        outside: "text-muted-foreground opacity-50 aria-selected:opacity-30",
        disabled: "text-muted-foreground opacity-50",
        range_middle: "bg-muted/60 text-foreground",
        hidden: "invisible",
        ...classNames,
      }}
      {...props}
    />
  );
}

