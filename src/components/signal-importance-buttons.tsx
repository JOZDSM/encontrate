"use client";

import { cn } from "@/lib/utils";

/**
 * 1–10 importance scale used in the Señal wizard's Step 4 (cleanliness, order).
 * Renders 10 square buttons; the active one is filled with `--foreground`.
 */
export function SignalImportanceButtons({
  value,
  onChange,
  ariaLabel,
}: {
  value: number | null;
  onChange: (next: number) => void;
  ariaLabel: string;
}) {
  return (
    <div role="radiogroup" aria-label={ariaLabel} className="flex flex-wrap gap-2">
      {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
        const active = value === n;
        return (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(n)}
            className={cn(
              "inline-flex size-10 items-center justify-center rounded-lg border text-sm font-medium tabular-nums transition-colors",
              active
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-background text-foreground hover:bg-foreground/10",
            )}
          >
            {n}
          </button>
        );
      })}
    </div>
  );
}
