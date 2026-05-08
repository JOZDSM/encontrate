"use client";

import Link from "next/link";
import {
  ChevronRight,
  Heart,
  LayoutGrid,
  MessageSquare,
  Settings2,
} from "lucide-react";
import type { MisCosasNavHref } from "@/lib/mis-cosas-nav";
import { MIS_COSAS_NAV } from "@/lib/mis-cosas-nav";

const ICONS: Record<MisCosasNavHref, typeof LayoutGrid> = {
  "/mis-cosas/anuncios": LayoutGrid,
  "/mis-cosas/mensajes": MessageSquare,
  "/mis-cosas/favoritos": Heart,
  "/mis-cosas/configuracion": Settings2,
};

export function MisCosasMobileHub() {
  return (
    <ul className="flex flex-col gap-2 px-4 py-4">
      {MIS_COSAS_NAV.map((item) => {
        const Icon = ICONS[item.href];
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              className="flex h-14 items-center justify-between rounded-xl border border-border bg-background px-4 text-foreground transition-colors hover:bg-foreground/5 active:bg-foreground/10"
            >
              <span className="flex items-center gap-3 text-base font-medium">
                <Icon className="size-5 shrink-0" aria-hidden />
                {item.label}
              </span>
              <ChevronRight
                className="size-5 shrink-0 text-muted-foreground"
                aria-hidden
              />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
