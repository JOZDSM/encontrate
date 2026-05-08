"use client";

import { ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";
import { activeMisCosasSection } from "@/lib/mis-cosas-nav";

export function MisCosasBreadcrumb() {
  const pathname = usePathname() ?? "";
  const active = activeMisCosasSection(pathname);

  return (
    <nav
      aria-label="Ruta"
      className="flex h-16 shrink-0 items-center border-b border-sidebar-border px-6"
    >
      <ol className="flex items-center gap-2 text-sm">
        <li className="text-muted-foreground">Panel</li>
        <li aria-hidden className="text-muted-foreground">
          <ChevronRight className="size-4" />
        </li>
        <li aria-current="page" className="text-foreground">
          {active?.label ?? "Panel"}
        </li>
      </ol>
    </nav>
  );
}
