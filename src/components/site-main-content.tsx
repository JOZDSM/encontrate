"use client";

import { usePathname } from "next/navigation";
import { isServicesCatalogSurface } from "@/lib/service-slug";
import { cn } from "@/lib/utils";

export function SiteMainContent({ children }: { children: React.ReactNode }) {
  const catalogSurface = isServicesCatalogSurface(usePathname());

  return (
    <div
      className={cn(
        catalogSurface
          ? "flex flex-col"
          : "flex min-h-0 flex-1 flex-col md:min-h-0",
      )}
    >
      {children}
    </div>
  );
}
