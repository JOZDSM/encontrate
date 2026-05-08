"use client";

import Link from "next/link";
import { useLayoutEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { EncontrateMark } from "@/components/encontrate-mark";
import { ANIMATIONS } from "@/lib/animations";
import { Button } from "@/components/ui/button";

const INTRO_MS = 3000;
const FADE_MS = 700;
const FADE_START_MS = INTRO_MS - FADE_MS;
const HOME_INTRO_SEEN_KEY = "encontrate-home-hero-intro-seen";

export function HomeHero() {
  const { data: session, status } = useSession();
  const authed = status === "authenticated" && Boolean(session?.user);

  // Keep first client render identical to SSR to avoid hydration mismatch.
  const [introVisible, setIntroVisible] = useState(true);
  const [introFading, setIntroFading] = useState(false);

  useLayoutEffect(() => {
    // Only show the intro the first time per *browser session*.
    try {
      if (window.sessionStorage.getItem(HOME_INTRO_SEEN_KEY)) {
        const id = window.setTimeout(() => setIntroVisible(false), 0);
        return () => window.clearTimeout(id);
      }
    } catch {
      // Storage blocked/private mode — treat as "not seen" and run the intro.
    }

    const fadeId = window.setTimeout(() => setIntroFading(true), FADE_START_MS);
    const doneId = window.setTimeout(() => {
      setIntroVisible(false);
      try {
        window.sessionStorage.setItem(HOME_INTRO_SEEN_KEY, "1");
      } catch {
        /* ignore */
      }
    }, INTRO_MS);

    return () => {
      window.clearTimeout(fadeId);
      window.clearTimeout(doneId);
    };
  }, []);

  return (
    <div className="relative flex min-h-0 w-full flex-1 overflow-x-hidden">
      {/* Centered in the actual viewport (not "content area minus footer"). */}
      <div className="pointer-events-none fixed inset-0 z-[10] flex items-center justify-center px-4">
        <div className="flex flex-col items-center">
          <h1 className="max-w-[22rem] text-balance text-center text-2xl font-semibold tracking-tight text-primary-foreground dark:text-foreground sm:max-w-none sm:text-3xl">
            <span className="block">Hola!</span>{" "}
            <span className="block sm:inline">Estás en el lugar correcto</span>{" "}
            <span role="img" aria-label="relieved face">
              😌
            </span>
          </h1>

          <div className="pointer-events-auto w-full pt-4 sm:hidden">
            <Button
              asChild
              size="default"
              variant="secondary"
              className="w-full rounded-full font-medium shadow-xs"
            >
              <Link href={authed ? "/mis-cosas/mensajes" : "/login"}>
                {authed ? "Panel" : "Iniciá sesión"}
              </Link>
            </Button>
          </div>
        </div>
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
