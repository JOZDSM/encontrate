"use client";

import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Props = {
  id: string;
  label: string;
  /** `null` shows `emptyHint` until the user taps +/− (1–10 style fields). */
  value: number | null;
  onChange: (next: number) => void;
  disabled?: boolean;
  min?: number;
  max?: number;
  /** Shown in the center when `value` is `null` (defaults to `"{min}–{max}"`). */
  emptyHint?: string;
};

/** Pill with − / + for bounded numeric steps (age, 1–10 scales, etc.). */
export function SignalSteppedMeter({
  id,
  label,
  value,
  onChange,
  disabled,
  min = 1,
  max = 10,
  emptyHint,
}: Props) {
  const hint = emptyHint ?? `${min}–${max}`;
  const seed = Math.floor((min + max) / 2);
  const effective = value ?? seed;
  const bump = (delta: number) => {
    const base = value ?? seed;
    onChange(Math.min(max, Math.max(min, base + delta)));
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div
        id={id}
        className={cn(
          "flex h-12 items-stretch justify-between gap-2 rounded-full border border-border bg-input/30 px-1",
          disabled && "pointer-events-none opacity-50",
        )}
      >
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="shrink-0 rounded-full"
          disabled={disabled || effective <= min}
          onClick={() => bump(-1)}
          aria-label="Menos"
        >
          <Minus className="size-4" aria-hidden />
        </Button>
        <div className="flex min-w-0 flex-1 items-center justify-center tabular-nums text-sm font-medium text-foreground">
          {value === null ? (
            <span className="text-muted-foreground">{hint}</span>
          ) : (
            <span>{value}</span>
          )}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="shrink-0 rounded-full"
          disabled={disabled || effective >= max}
          onClick={() => bump(1)}
          aria-label="Más"
        >
          <Plus className="size-4" aria-hidden />
        </Button>
      </div>
    </div>
  );
}
