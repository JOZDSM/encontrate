"use client";

import { Minus, Plus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Props = {
  id: string;
  label: string;
  /** `null` shows `emptyHint` until the user taps +/− (1–10 style fields). */
  value: number | null;
  onChange: (next: number | null) => void;
  disabled?: boolean;
  min?: number;
  max?: number;
  /** Shown in the center when `value` is `null` (defaults to `"{min}–{max}"`). */
  emptyHint?: string;
  /** When true, the central readout is a typeable numeric input. */
  editable?: boolean;
  /**
   * Value to bump from when +/− is pressed and `value` is `null`. Defaults to
   * the midpoint so 1–10 scales drop somewhere reasonable on first click; pass
   * `0` for fields like age where the user expects to add up from zero.
   */
  seedWhenEmpty?: number;
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
  editable = false,
  seedWhenEmpty,
}: Props) {
  const hint = emptyHint ?? `${min}–${max}`;
  const seed =
    seedWhenEmpty !== undefined
      ? Math.min(max, Math.max(min, seedWhenEmpty))
      : Math.floor((min + max) / 2);
  const effective = value ?? seed;
  const bump = (delta: number) => {
    const base = value ?? seed;
    onChange(Math.min(max, Math.max(min, base + delta)));
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div
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
          className="grid size-8 shrink-0 place-items-center border-r border-input text-primary transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Minus className="size-4" aria-hidden />
        </button>
        {editable ? (
          <input
            id={id}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={value === null ? "" : String(value)}
            disabled={disabled}
            placeholder={hint}
            onChange={(e) => {
              const raw = e.target.value.replace(/[^0-9]/g, "");
              if (raw === "") {
                onChange(null);
                return;
              }
              const n = Number(raw);
              onChange(Math.min(max, Math.max(min, n)));
            }}
            className="min-w-0 flex-1 bg-transparent text-center text-sm font-medium tabular-nums text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
          />
        ) : (
          <div
            id={id}
            className="flex min-w-0 flex-1 items-center justify-center tabular-nums text-sm font-medium text-foreground"
          >
            {value === null ? (
              <span className="text-muted-foreground">{hint}</span>
            ) : (
              <span>{value}</span>
            )}
          </div>
        )}
        <button
          type="button"
          aria-label="Más"
          disabled={disabled || effective >= max}
          onClick={() => bump(1)}
          className="grid size-8 shrink-0 place-items-center border-l border-input text-primary transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="size-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
