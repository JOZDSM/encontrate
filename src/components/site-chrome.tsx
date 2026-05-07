"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { HomeNavbar } from "@/components/home-navbar";
import { RotatingSiteBackground } from "@/components/rotating-site-background";
import { SupportEncontrateBanner } from "@/components/support-encontrate-banner";
import { isPublicListingDetailPath } from "@/lib/listing-route";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const plainBackground = isPublicListingDetailPath(pathname);
  const [bannerVisible, setBannerVisible] = useState(false);

  return (
    <RotatingSiteBackground isHome={isHome} disabled={plainBackground}>
      {isHome ? (
        <SupportEncontrateBanner onVisibleChange={setBannerVisible} />
      ) : null}
      <HomeNavbar topOffset={isHome && bannerVisible ? "banner" : "none"} />
      {children}
    </RotatingSiteBackground>
  );
}
