"use client";

import { usePathname } from "next/navigation";
import { HomeNavbar } from "@/components/home-navbar";
import { RotatingSiteBackground } from "@/components/rotating-site-background";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const plainBackground = pathname?.startsWith("/listings");

  return (
    <RotatingSiteBackground isHome={isHome} disabled={plainBackground}>
      <HomeNavbar />
      {children}
    </RotatingSiteBackground>
  );
}
