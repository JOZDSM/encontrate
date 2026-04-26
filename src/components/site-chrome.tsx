"use client";

import { usePathname } from "next/navigation";
import { HomeNavbar } from "@/components/home-navbar";
import { RotatingSiteBackground } from "@/components/rotating-site-background";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <RotatingSiteBackground isHome={isHome}>
      <HomeNavbar />
      {children}
    </RotatingSiteBackground>
  );
}
