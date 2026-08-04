"use client";

import { useLayoutEffect } from "react";
import { usePathname } from "next/navigation";
import { isServicesCatalogSurface } from "@/lib/service-slug";

const HOME_SCROLL_CLASS = "home-document-scroll";

/** Document scroll for services catalog surfaces (home + service detail). */
export function SiteHomeDocumentScroll() {
  const pathname = usePathname();
  const enabled = isServicesCatalogSurface(pathname);

  useLayoutEffect(() => {
    if (!enabled) return;

    document.documentElement.classList.add(HOME_SCROLL_CLASS);
    document.body.classList.add(HOME_SCROLL_CLASS);

    return () => {
      document.documentElement.classList.remove(HOME_SCROLL_CLASS);
      document.body.classList.remove(HOME_SCROLL_CLASS);
    };
  }, [enabled]);

  return null;
}
