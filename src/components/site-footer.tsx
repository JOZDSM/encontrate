"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isPublicListingDetailPath } from "@/lib/listing-route";
import { cn } from "@/lib/utils";

export function SiteFooter() {
  const pathname = usePathname();
  const plainBackground = isPublicListingDetailPath(pathname);

  return (
    <footer
      className={cn(
        "flex shrink-0 flex-col items-center justify-center gap-1 border-t border-border px-4 py-6 text-center text-sm",
        plainBackground
          ? "bg-background text-muted-foreground"
          : "text-primary-foreground/80 dark:text-foreground",
        "transition-[border-color] duration-300 ease-out",
        "md:border-transparent md:hover:border-border md:focus-within:border-border",
      )}
    >
      <p className="px-4 leading-snug">
        Encontrate solamente genera encuentros entre personas.{" "}
        <Link
          href="/aviso"
          className={cn(
            "underline underline-offset-2",
            plainBackground
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
