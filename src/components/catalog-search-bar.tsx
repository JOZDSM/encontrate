"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type CatalogSearchBarProps = {
  variant?: "compact" | "prominent";
  matchButtonHeight?: boolean;
  className?: string;
  inputClassName?: string;
  id?: string;
  onFocus?: () => void;
};

export function CatalogSearchBar({
  variant = "prominent",
  matchButtonHeight = false,
  className,
  inputClassName,
  id,
  onFocus,
}: CatalogSearchBarProps) {
  const isCompact = variant === "compact";

  return (
    <div
      data-catalog-search={variant}
      className={cn(
        "relative w-full",
        isCompact ? "max-w-xs" : "mx-auto max-w-2xl",
        className,
      )}
    >
      <Search
        className={cn(
          "pointer-events-none absolute top-1/2 -translate-y-1/2",
          isCompact
            ? "left-3 size-4 text-foreground"
            : "left-5 size-5 text-white/60",
        )}
        aria-hidden
      />
      <Input
        id={id}
        type="search"
        readOnly
        placeholder={
          isCompact ? "Encontrá…" : "Encontrá lo que precisás…"
        }
        aria-label="Buscar servicios (próximamente)"
        onFocus={onFocus}
        className={cn(
          "w-full rounded-full shadow-none read-only:cursor-default",
          isCompact
            ? cn(
                "border-transparent bg-muted/50 text-foreground placeholder:text-foreground focus-visible:border-transparent focus-visible:ring-0",
                matchButtonHeight
                  ? "h-9 pr-10 pl-9 text-sm"
                  : "h-10 pr-11 pl-10 text-sm",
              )
            : "h-14 border border-white/20 bg-white/10 pr-[3.25rem] pl-14 text-base text-white placeholder:text-white/50",
          inputClassName,
        )}
      />
      <kbd
        className={cn(
          "pointer-events-none absolute top-1/2 flex shrink-0 -translate-y-1/2 items-center justify-center",
          "box-border rounded-full font-mono leading-none",
          isCompact
            ? cn(
                "border border-foreground bg-transparent text-foreground",
                /* h-9/h-10: circle sized so top = bottom = right inset */
                matchButtonHeight
                  ? "right-1 size-7 text-[11px]"
                  : "right-1.5 size-7 text-[11px]",
              )
            : /* h-14 (56px) − 2×6px inset → 44px circle */
              "right-1.5 size-11 border border-white/25 bg-white/10 text-sm text-white/70",
        )}
      >
        E
      </kbd>
    </div>
  );
}
