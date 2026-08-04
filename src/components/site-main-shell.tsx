"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function SiteMainShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <main
      className={cn(
        isHome
          ? "flex flex-col"
          : "flex min-h-0 flex-1 flex-col overflow-visible md:overflow-hidden",
        isHome ? "pt-0" : "pt-20 md:pt-28",
      )}
    >
      {children}
    </main>
  );
}
