"use client";

import { usePathname } from "next/navigation";
import { CatalogSearchProvider } from "@/components/catalog-search-provider";
import { HomeCatalogNavbar } from "@/components/home-catalog-navbar";
import { HomeNavbar } from "@/components/home-navbar";
import { RotatingSiteBackground } from "@/components/rotating-site-background";
import { SupportEncontrateBanner } from "@/components/support-encontrate-banner";
import { isPublicListingDetailPath } from "@/lib/listing-route";
import { isServicesCatalogSurface } from "@/lib/service-slug";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const catalogSurface = isServicesCatalogSurface(pathname);
  const plainBackground =
    isPublicListingDetailPath(pathname) || catalogSurface;

  const chrome = (
    <RotatingSiteBackground isHome={catalogSurface} disabled={plainBackground}>
      {catalogSurface ? null : <SupportEncontrateBanner />}
      {catalogSurface ? <HomeCatalogNavbar /> : <HomeNavbar />}
      {children}
    </RotatingSiteBackground>
  );

  if (!catalogSurface) return chrome;

  // Search index loads published services from /api/catalog/services (and
  // homepage HomeServicesCatalog can still push a fresher list). Do not seed
  // with MOCK catalog — that hid newly added DB services from search.
  return <CatalogSearchProvider>{chrome}</CatalogSearchProvider>;
}
