"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

/**
 * Wraps the main scroll band that lives between the navbar and the desktop
 * footer. On `/mis-cosas/*` pages it renders the boxed-panel borders that
 * close the bracket around the sidebar shell (which already has `border-x`).
 * Everywhere else those horizontal rules are noise, so they're omitted.
 */
export function SiteMainScrollBand({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPanel = Boolean(pathname && pathname.startsWith("/mis-cosas"));
  const isHome = pathname === "/";

  return (
    <div
      data-site-scroll-band
      className={cn(
        "flex flex-col",
        isHome
          ? "overflow-visible"
          : "min-h-0 flex-1 overflow-visible md:overflow-y-auto md:overscroll-y-contain",
        isPanel && "md:border-t md:border-b md:border-sidebar-border",
      )}
    >
      {children}
    </div>
  );
}
