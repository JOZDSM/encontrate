"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useOptionalCatalogSearch } from "@/components/catalog-search-provider";
import { cn } from "@/lib/utils";

type CatalogSearchBarProps = {
  variant?: "compact" | "prominent";
  matchButtonHeight?: boolean;
  className?: string;
  inputClassName?: string;
  id?: string;
  onActivate?: () => void;
};

export function CatalogSearchBar({
  variant = "prominent",
  matchButtonHeight = false,
  className,
  inputClassName,
  id,
  onActivate,
}: CatalogSearchBarProps) {
  const isCompact = variant === "compact";
  const search = useOptionalCatalogSearch();

  const activate = () => {
    onActivate?.();
    search?.openSearch();
  };

  return (
    <div
      data-catalog-search={variant}
      className={cn(
        "relative w-full",
        isCompact ? "max-w-xs" : "md:mx-auto md:max-w-2xl",
        className,
      )}
    >
      <Search
        className={cn(
          "pointer-events-none absolute top-1/2 -translate-y-1/2",
          isCompact
            ? "left-3 size-4 text-foreground"
            : "left-4 size-4 text-white/60 md:left-5 md:size-5",
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
        aria-label="Buscar servicios"
        onFocus={activate}
        onClick={activate}
        className={cn(
          "w-full cursor-pointer rounded-full shadow-none read-only:cursor-pointer md:transition-shadow border!",
          isCompact
            ? cn(
                "border-transparent bg-muted/50 text-foreground placeholder:text-foreground focus-visible:border-transparent! focus-visible:ring-0!",
                matchButtonHeight
                  ? "h-9 pr-10 pl-9 text-sm"
                  : "h-10 pr-11 pl-10 text-sm",
              )
            : cn(
                "h-12 border border-white/20 bg-white/10 pr-12 pl-11 text-base text-white placeholder:text-white/50 md:h-14 md:pr-[3.25rem] md:pl-14 md:text-base",
                "focus-visible:border-white/20! focus-visible:ring-0!",
              ),
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
                matchButtonHeight
                  ? "right-1 size-7 text-[11px]"
                  : "right-1.5 size-7 text-[11px]",
              )
            : "right-1.5 size-9 border border-white/25 bg-white/10 text-xs text-white/70 md:size-11 md:text-sm",
        )}
      >
        E
      </kbd>
    </div>
  );
}
