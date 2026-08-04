"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function SiteMainContent({ children }: { children: React.ReactNode }) {
  const isHome = usePathname() === "/";

  return (
    <div
      className={cn(
        isHome ? "flex flex-col" : "flex min-h-0 flex-1 flex-col md:min-h-0",
      )}
    >
      {children}
    </div>
  );
}
