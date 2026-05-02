"use client";

import { useEffect, useState } from "react";
import { HOME_HERO_IMAGES } from "@/lib/home-hero-images";
import { cn } from "@/lib/utils";

/**
 * Full-viewport rotating photos under the app.
 *
 * - Home: light scrim (`bg-black/30`), sharp images.
 * - Any other route: **80% black** scrim + **10px blur** on each image layer (oversized + clipped).
 *
 * Stack: `fixed` photo plane (z-0) → `fixed` scrim (z-[1]) → content (z-[2]).
 */
export function RotatingSiteBackground({
  children,
  isHome,
  disabled = false,
}: {
  children: React.ReactNode;
  /** `/` only. Everything else uses dark scrim + blurred photos. */
  isHome: boolean;
  /** When true, render children without any background layers. */
  disabled?: boolean;
}) {
  const [bgIndex, setBgIndex] = useState(0);

  useEffect(() => {
    if (disabled) return;
    if (HOME_HERO_IMAGES.length <= 1) return;
    const id = window.setInterval(() => {
      setBgIndex((i) => (i + 1) % HOME_HERO_IMAGES.length);
    }, 10_000);
    return () => window.clearInterval(id);
  }, [disabled]);

  if (disabled) {
    return (
      <div className="relative flex h-full min-h-0 w-full flex-1 flex-col bg-background text-foreground">
        {children}
      </div>
    );
  }

  const inner = !isHome;

  return (
    <div className="relative flex h-full min-h-0 w-full flex-1 flex-col">
      {/* Photo stack */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-black"
      >
        <div className="absolute inset-0 bg-black" />

        {HOME_HERO_IMAGES.map((src, i) => (
          <div
            key={src}
            className={cn(
              "absolute transition-opacity duration-[2500ms] ease-in-out motion-reduce:transition-none",
              inner
                ? [
                    "left-1/2 top-1/2 h-[135vh] w-[135vw] max-w-none -translate-x-1/2 -translate-y-1/2",
                    "blur-[10px]",
                    "motion-reduce:left-0 motion-reduce:top-0 motion-reduce:h-full motion-reduce:w-full",
                    "motion-reduce:translate-x-0 motion-reduce:translate-y-0 motion-reduce:blur-none",
                  ]
                : "inset-0",
              i === bgIndex
                ? "z-[2] opacity-100"
                : "z-[1] opacity-0",
            )}
          >
            <img
              src={src}
              alt=""
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
          </div>
        ))}
      </div>

      {/* Scrim — must be its own fixed layer above photos */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none fixed inset-0 z-[1]",
          isHome ? "bg-black/30" : "bg-black/80",
        )}
      />

      <div className="relative z-[2] flex h-full min-h-0 w-full flex-1 flex-col">
        {children}
      </div>
    </div>
  );
}
