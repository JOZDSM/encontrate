"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isPublicListingDetailPath } from "@/lib/listing-route";
import { HOME_CHROME_MAX_WIDTH_CLASS, HOME_PAGE_GUTTER_CLASS } from "@/lib/home-catalog-layout";
import { cn } from "@/lib/utils";

export function SiteFooter() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const plainBackground = isPublicListingDetailPath(pathname) || isHome;
  const isMisCosas = Boolean(pathname && pathname.startsWith("/mis-cosas"));

  return (
    <footer
      className={cn(
        "flex shrink-0 flex-col items-center justify-center gap-1 border-t py-6 text-center text-sm",
        isHome && HOME_PAGE_GUTTER_CLASS,
        isHome
          ? "border-transparent bg-black text-white/70"
          : plainBackground
            ? "border-border bg-background px-4 text-muted-foreground"
            : "border-transparent px-4 text-primary-foreground/80 dark:text-foreground",
        "transition-[border-color] duration-300 ease-out",
        isMisCosas
          ? "md:border-transparent"
          : "md:border-transparent md:hover:border-border md:focus-within:border-border",
      )}
    >
      <p
        className={cn(
          "leading-snug",
          isHome ? cn("w-full", HOME_CHROME_MAX_WIDTH_CLASS) : "px-4",
        )}
      >
        Encontrate solamente genera encuentros entre personas.{" "}
        <Link
          href="/aviso"
          className={cn(
            "underline underline-offset-2",
            isHome
              ? "text-white hover:text-white/80"
              : plainBackground
                ? "text-foreground hover:text-foreground/80"
                : "hover:text-primary-foreground dark:text-foreground",
          )}
        >
          Aviso legal
        </Link>
      </p>
    </footer>
  );
}
