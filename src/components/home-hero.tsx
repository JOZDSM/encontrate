"use client";

import Link from "next/link";
import { useLayoutEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { EncontrateMark } from "@/components/encontrate-mark";
import { ANIMATIONS } from "@/lib/animations";

const HOME_HERO_INTRO_KEY = "encontrate-home-hero-intro-seen";

export function HomeHero() {
  // Important: keep first client render identical to SSR to avoid hydration mismatch.
  const [showCtas, setShowCtas] = useState(false);

  // useLayoutEffect + closure flag (no refs): Strict Mode safe; short loading mark before crossfade (700ms).
  useLayoutEffect(() => {
    try {
      if (window.sessionStorage.getItem(HOME_HERO_INTRO_KEY)) {
        // Defer state update to avoid sync setState-in-effect lint + keep hydration stable.
        const id = window.setTimeout(() => setShowCtas(true), 0);
        return () => clearTimeout(id);
      }
    } catch {
      // private mode / storage blocked — fall through to timed intro
    }

    let done = false;
    const reveal = () => {
      if (done) return;
      done = true;
      setShowCtas(true);
      try {
        window.sessionStorage.setItem(HOME_HERO_INTRO_KEY, "1");
      } catch {
        /* ignore */
      }
    };

    const id = window.setTimeout(reveal, 3000);

    return () => {
      clearTimeout(id);
    };
  }, []);

  return (
    <div className="relative flex min-h-0 w-full flex-1 flex-col items-center justify-center overflow-x-hidden px-4 py-6">
      <div className="relative isolate grid min-h-[4.5rem] w-full max-w-2xl grid-cols-1 grid-rows-1 place-items-center">
        <div
          className={cn(
            "col-start-1 row-start-1 z-0 flex flex-col items-center transition-opacity duration-700 ease-in-out motion-reduce:transition-none",
            showCtas
              ? "opacity-100"
              : "pointer-events-none opacity-0",
          )}
          aria-hidden={!showCtas}
          inert={!showCtas ? true : undefined}
        >
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:flex-wrap">
            <Button
              asChild
              variant="secondary"
              size="sm"
              className="rounded-full font-medium shadow-xs"
            >
              <Link href="/listings">Buscar habitación</Link>
            </Button>
            <Button
              asChild
              variant="secondary"
              size="sm"
              className="rounded-full font-medium shadow-xs"
            >
              <Link href="/host/listings/new">Cargar habitación</Link>
            </Button>
          </div>
        </div>
        <div
          className={cn(
            "col-start-1 row-start-1 z-10 flex items-center justify-center transition-opacity duration-700 ease-in-out motion-reduce:transition-none",
            showCtas
              ? "pointer-events-none opacity-0"
              : "opacity-100",
          )}
          aria-hidden={showCtas}
        >
          <EncontrateMark
            className={cn(
              "size-16 text-primary-foreground dark:text-foreground",
              ANIMATIONS.MARK_SPIN_360_EASE_1S,
            )}
            style={{ animationIterationCount: 3 }}
          />
        </div>
      </div>
    </div>
  );
}
