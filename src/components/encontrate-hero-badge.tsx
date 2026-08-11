import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "hero" | "card";

const BADGE_SRC: Record<BadgeVariant, string> = {
  /** Cutout “e” — reads on dark hero photography */
  hero: "/design/home-services/encontrate-badge.svg",
  /** Solid green + black “e” — for photo service cards */
  card: "/design/home-services/encontrate-badge-card.svg",
};

/** Lime seal mark (40×40). */
export function EncontrateHeroBadge({
  variant = "hero",
  className,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement> & { variant?: BadgeVariant }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={BADGE_SRC[variant]}
      alt=""
      width={40}
      height={40}
      decoding="async"
      aria-hidden="true"
      className={cn("pointer-events-none size-10 max-h-10 max-w-10", className)}
      {...props}
    />
  );
}

/** Wraps a hero logo/title and places the encontrate badge at the top-right. */
export function HeroBrandWithBadge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex max-w-full items-start gap-1 md:gap-2",
        className,
      )}
    >
      <div className="min-w-0 max-w-full shrink">{children}</div>
      <EncontrateHeroBadge className="mt-0.5 size-8 shrink-0 -translate-y-1/4 max-h-8 max-w-8 md:mt-0 md:size-10 md:max-h-10 md:max-w-10 md:-translate-y-1/3" />
    </div>
  );
}
