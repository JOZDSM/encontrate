"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { activeMisCosasSection } from "@/lib/mis-cosas-nav";

export function MisCosasMobileBreadcrumb() {
  const pathname = usePathname() ?? "";
  const active = activeMisCosasSection(pathname);

  return (
    <nav
      aria-label="Ruta"
      className="flex h-16 shrink-0 items-center gap-6 border-b border-sidebar-border px-6"
    >
      <Link
        href="/mis-cosas"
        aria-label="Volver al panel"
        className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-foreground/10"
      >
        <ChevronLeft className="size-4" aria-hidden />
      </Link>
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
