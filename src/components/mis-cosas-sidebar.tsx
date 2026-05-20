"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Heart,
  LayoutGrid,
  MessageSquare,
  Search,
  Settings2,
  Shield,
  UserPlus,
} from "lucide-react";
import type { MisCosasNavHref } from "@/lib/mis-cosas-nav";
import { MIS_COSAS_NAV } from "@/lib/mis-cosas-nav";
import { cn } from "@/lib/utils";

const ICONS: Record<MisCosasNavHref, typeof LayoutGrid> = {
  "/mis-cosas/anuncios": LayoutGrid,
  "/mis-cosas/mensajes": MessageSquare,
  "/mis-cosas/favoritos": Heart,
  "/mis-cosas/signals": UserPlus,
  "/mis-cosas/buscar-huesped": Search,
  "/mis-cosas/configuracion": Settings2,
};

const itemClass =
  "flex h-9 items-center gap-2 rounded-md px-2 text-sm font-medium text-foreground transition-colors hover:bg-foreground/10";

export function MisCosasSidebar({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname() ?? "";

  return (
    <aside className="hidden w-[255px] shrink-0 flex-col border-r border-sidebar-border bg-background md:flex">
      <nav aria-label="Panel" className="flex flex-1 flex-col overflow-y-auto p-2 md:px-4 md:pt-6 md:pb-0">
        <ul className="flex flex-col gap-1">
          {MIS_COSAS_NAV.map((item) => {
            const Icon = ICONS[item.href];
            const active = item.match(pathname);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(itemClass, active && "bg-foreground/10")}
                >
                  <Icon className="size-4 shrink-0" aria-hidden />
                  <span className="truncate">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      {isAdmin ? (
        <div className="border-t border-sidebar-border p-2">
          <Link
            href="/admin"
            aria-current={pathname.startsWith("/admin") ? "page" : undefined}
            className={cn(
              itemClass,
              pathname.startsWith("/admin") && "bg-foreground/10",
            )}
          >
            <Shield className="size-4 shrink-0" aria-hidden />
            <span className="truncate">Administración</span>
          </Link>
        </div>
      ) : null}
    </aside>
  );
}
