"use client";

import { usePathname } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { isServicesCatalogSurface } from "@/lib/service-slug";

export function SiteInBandFooter() {
  const pathname = usePathname();
  if (isServicesCatalogSurface(pathname)) return null;

  return (
    <div className="shrink-0 md:hidden">
      <SiteFooter />
    </div>
  );
}

export function SiteOutsideFooter() {
  const pathname = usePathname();
  if (isServicesCatalogSurface(pathname)) return null;

  return (
    <div className="hidden shrink-0 md:block">
      <SiteFooter />
    </div>
  );
}
