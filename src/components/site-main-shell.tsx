"use client";

import { usePathname } from "next/navigation";
import { isServicesCatalogSurface } from "@/lib/service-slug";
import { cn } from "@/lib/utils";

export function SiteMainShell({ children }: { children: React.ReactNode }) {
  const catalogSurface = isServicesCatalogSurface(usePathname());

  return (
    <main
      className={cn(
        catalogSurface
          ? "flex flex-col"
          : "flex min-h-0 flex-1 flex-col overflow-visible md:overflow-hidden",
        catalogSurface ? "pt-0" : "pt-20 md:pt-28",
      )}
    >
      {children}
    </main>
  );
}
