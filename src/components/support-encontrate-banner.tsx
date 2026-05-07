"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { BMAC_URL } from "@/lib/bmac";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "encontrate.bmacBannerDismissed";

type Props = {
  /** Notified whenever the banner mounts/unmounts so the navbar can shift down. */
  onVisibleChange?: (visible: boolean) => void;
};

export function SupportEncontrateBanner({ onVisibleChange }: Props) {
  // Start hidden so SSR + first client paint match (avoids hydration mismatches).
  // After mount we read localStorage and decide whether to show.
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const dismissed = window.localStorage.getItem(STORAGE_KEY) === "1";
    if (!dismissed) setVisible(true);
  }, []);

  useEffect(() => {
    onVisibleChange?.(visible);
  }, [visible, onVisibleChange]);

  if (!visible) return null;

  function dismiss(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, "1");
    }
    setVisible(false);
  }

  return (
    <a
      href={BMAC_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "fixed top-0 right-0 left-0 z-[101] flex h-10 items-center justify-center px-4 md:h-12",
        "bg-brand-background text-primary-foreground",
        "text-sm font-medium",
        "transition-colors hover:bg-brand-background/90",
      )}
      aria-label="Apoyar encontrate en Buy Me a Coffee"
    >
      <span className="text-center">
        <span className="hidden sm:inline">Apoyá encontrate ☕ </span>
        <span className="underline underline-offset-4">
          Invitanos un café
        </span>
      </span>
      <button
        type="button"
        onClick={dismiss}
        className={cn(
          "absolute top-1/2 right-2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-full",
          "text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground",
        )}
        aria-label="Cerrar mensaje de apoyo"
      >
        <X className="size-4" aria-hidden />
      </button>
    </a>
  );
}
