"use client";

import { usePathname } from "next/navigation";
import { CatalogSearchProvider } from "@/components/catalog-search-provider";
import { HomeCatalogNavbar } from "@/components/home-catalog-navbar";
import { HomeNavbar } from "@/components/home-navbar";
import { RotatingSiteBackground } from "@/components/rotating-site-background";
import { SupportEncontrateBanner } from "@/components/support-encontrate-banner";
import { flattenCatalogOfferings } from "@/lib/catalog-search";
import { isPublicListingDetailPath } from "@/lib/listing-route";
import {
  MOCK_CATEGORY_ROWS,
  MOCK_RECENT_SERVICES,
} from "@/lib/mock-services-catalog";
import { isServicesCatalogSurface } from "@/lib/service-slug";

const DEFAULT_CATALOG_SERVICES = flattenCatalogOfferings(
  MOCK_RECENT_SERVICES,
  MOCK_CATEGORY_ROWS,
);

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

  return (
    <CatalogSearchProvider initialServices={DEFAULT_CATALOG_SERVICES}>
      {chrome}
    </CatalogSearchProvider>
  );
}
