"use client";

import { usePathname } from "next/navigation";
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

  return (
    <RotatingSiteBackground isHome={catalogSurface} disabled={plainBackground}>
      {catalogSurface ? null : <SupportEncontrateBanner />}
      {catalogSurface ? <HomeCatalogNavbar /> : <HomeNavbar />}
      {children}
    </RotatingSiteBackground>
  );
}
