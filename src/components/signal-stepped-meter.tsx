"use client";

import { Minus, Plus } from "lucide-react";
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

/**
 * 32-px pill with − / + for bounded numeric steps (age, 1–10 scales, …). The
 * +/− buttons are square 32×32 and separated from the readout by a vertical
 * divider, matching the Figma spec.
 */
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
          "flex h-8 items-stretch overflow-hidden rounded-full border border-input bg-input/30",
          disabled && "pointer-events-none opacity-50",
        )}
      >
        <button
          type="button"
          aria-label="Menos"
          disabled={disabled || effective <= min}
          onClick={() => bump(-1)}
          className="grid size-8 shrink-0 place-items-center border-r border-input text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Minus className="size-4" aria-hidden />
        </button>
        <div className="flex min-w-0 flex-1 items-center justify-center tabular-nums text-sm font-medium text-foreground">
          {value === null ? (
            <span className="text-muted-foreground">{hint}</span>
          ) : (
            <span>{value}</span>
          )}
        </div>
        <button
          type="button"
          aria-label="Más"
          disabled={disabled || effective >= max}
          onClick={() => bump(1)}
          className="grid size-8 shrink-0 place-items-center border-l border-input text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="size-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
