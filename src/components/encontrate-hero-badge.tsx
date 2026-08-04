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

/** Wraps a hero logo/title and pins the encontrate badge outside its top-right corner. */
export function HeroBrandWithBadge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("relative w-fit max-w-full", className)}>
      {children}
      <EncontrateHeroBadge className="absolute top-0 right-0 translate-x-4 -translate-y-4" />
    </div>
  );
}
