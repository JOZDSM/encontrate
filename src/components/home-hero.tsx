"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { EncontrateMark } from "@/components/encontrate-mark";
import { ANIMATIONS } from "@/lib/animations";

const INTRO_MS = 3000;
const FADE_MS = 700;
const FADE_START_MS = INTRO_MS - FADE_MS;

export function HomeHero() {
  // Always show intro on landing. (No sessionStorage gate.)
  // Keep first client render identical to SSR to avoid hydration mismatch.
  const [introVisible, setIntroVisible] = useState(true);
  const [introFading, setIntroFading] = useState(false);

  useEffect(() => {
    const fadeId = window.setTimeout(() => setIntroFading(true), FADE_START_MS);
    const doneId = window.setTimeout(() => setIntroVisible(false), INTRO_MS);
    return () => {
      window.clearTimeout(fadeId);
      window.clearTimeout(doneId);
    };
  }, []);

  return (
    <div className="relative flex min-h-0 w-full flex-1 overflow-x-hidden">
      {/* Centered in the actual viewport (not "content area minus footer"). */}
      <div className="pointer-events-none fixed inset-0 z-[10] flex items-center justify-center px-4">
        <h1 className="text-center text-2xl font-semibold tracking-tight text-primary-foreground dark:text-foreground sm:text-3xl">
          Bienvenidos a encontrate
        </h1>
      </div>

      {introVisible ? (
        <div
          className={cn(
            "fixed inset-0 z-[60] flex items-center justify-center bg-background transition-opacity ease-out motion-reduce:transition-none",
            introFading ? "opacity-0" : "opacity-100",
          )}
          style={{ transitionDuration: `${FADE_MS}ms` }}
          aria-hidden={introFading}
        >
          <EncontrateMark
            className={cn("size-16 text-foreground", ANIMATIONS.MARK_SPIN_360_EASE_1S)}
            style={{ animationIterationCount: 3 }}
          />
        </div>
      ) : null}
    </div>
  );
}
