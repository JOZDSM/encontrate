"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { signOutAction } from "@/app/actions/auth";
import { CatalogSearchBar } from "@/components/catalog-search-bar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EncontrateLockup } from "@/components/encontrate-lockup";
import { HOME_PAGE_GUTTER_CLASS } from "@/lib/home-catalog-layout";
import { cn } from "@/lib/utils";

type Props = {
  onSearchFocus?: () => void;
};

const SCROLL_BG_THRESHOLD_PX = 300;

function getMainScrollTop(): number {
  const band = document.querySelector<HTMLElement>("[data-site-scroll-band]");
  return Math.max(window.scrollY, band?.scrollTop ?? 0);
}

function scrollMainToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
  document
    .querySelector<HTMLElement>("[data-site-scroll-band]")
    ?.scrollTo({ top: 0, behavior: "smooth" });
}

export function HomeCatalogNavbar({ onSearchFocus }: Props) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const showPanel = status === "authenticated" && session?.user;
  const designPreview = Boolean(session?.user?.designPreview);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(getMainScrollTop() >= SCROLL_BG_THRESHOLD_PX);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const band = document.querySelector<HTMLElement>("[data-site-scroll-band]");
    band?.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      band?.removeEventListener("scroll", onScroll);
    };
  }, [pathname]);

  const scrollToMainSearch = () => {
    onSearchFocus?.();
    const el = document.getElementById("catalog-main-search");
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => el?.focus(), 350);
  };

  return (
    <>
      <header
        className={cn(
          "fixed top-0 right-0 left-0 z-[100] flex h-20 flex-col items-center justify-center border-b border-border md:h-28",
          HOME_PAGE_GUTTER_CLASS,
          "transition-[background-color,border-color] duration-300 ease-out",
          scrolled ? "bg-background/80" : "bg-background/10",
          "md:border-transparent md:hover:border-border md:focus-within:border-border",
        )}
      >
        <div className="flex w-full items-center justify-between">
          <Link
            href="/"
            aria-label="encontrate — Inicio"
            className="inline-flex items-center text-primary-foreground dark:text-foreground"
            onClick={(e) => {
              if (pathname === "/") {
                e.preventDefault();
                scrollMainToTop();
              }
            }}
          >
            <EncontrateLockup className="h-8 w-auto shrink-0" />
          </Link>

          <div className="hidden shrink-0 items-center gap-4 md:flex">
            <button
              type="button"
              className="w-56 shrink-0 cursor-pointer text-left"
              onClick={scrollToMainSearch}
              aria-label="Ir al buscador principal"
            >
              <CatalogSearchBar variant="compact" matchButtonHeight />
            </button>

            {showPanel && !designPreview ? (
              <>
                <Button
                  asChild
                  size="default"
                  variant="secondary"
                  className="shrink-0 rounded-full shadow-xs"
                >
                  <Link href="/mis-cosas">Panel</Link>
                </Button>
                <form action={signOutAction} className="shrink-0">
                  <Button
                    type="submit"
                    size="default"
                    variant="outline"
                    className="rounded-full border-primary-foreground/35 bg-transparent text-primary-foreground shadow-xs hover:bg-primary-foreground/10 dark:border-foreground/35 dark:text-foreground dark:hover:bg-foreground/10"
                  >
                    Cerrar sesión
                  </Button>
                </form>
              </>
            ) : (
              <Button
                asChild
                size="default"
                variant="secondary"
                className="shrink-0 rounded-full shadow-xs"
              >
                <Link href="/login">Iniciá sesión / Registrate</Link>
              </Button>
            )}

            <Button
              asChild
              size="default"
              variant="secondary"
              className="shrink-0 rounded-full bg-brand-background text-primary-foreground shadow-xs hover:bg-brand-background/90"
            >
              <Link href="/contacto">Contacto</Link>
            </Button>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-primary-foreground hover:bg-primary-foreground/10 dark:text-foreground dark:hover:bg-foreground/10"
              aria-label="Abrir menú"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(true)}
            >
              <Menu className="size-6" strokeWidth={2} />
            </Button>
          </div>
        </div>
      </header>

      <Dialog open={menuOpen} onOpenChange={setMenuOpen}>
        <DialogContent className="gap-4 border-border sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="sr-only">Menú de navegación</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <button
              type="button"
              className="w-full text-left"
              onClick={() => {
                closeMenu();
                scrollToMainSearch();
              }}
            >
              <CatalogSearchBar
                variant="compact"
                inputClassName="border-border bg-muted text-foreground placeholder:text-muted-foreground"
              />
            </button>
            <nav className="flex flex-col gap-1">
              {showPanel && !designPreview ? (
                <Link
                  href="/mis-cosas"
                  className="rounded-lg px-3 py-3 text-base font-semibold hover:bg-muted"
                  onClick={closeMenu}
                >
                  Panel
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="rounded-lg px-3 py-3 text-base font-semibold hover:bg-muted"
                  onClick={closeMenu}
                >
                  Iniciá sesión / Registrate
                </Link>
              )}
              <Link
                href="/contacto"
                className="rounded-lg px-3 py-3 text-base font-semibold hover:bg-muted"
                onClick={closeMenu}
              >
                Contacto
              </Link>
              {showPanel && !designPreview ? (
                <form action={signOutAction} className="pt-1">
                  <Button type="submit" variant="outline" className="w-full">
                    Cerrar sesión
                  </Button>
                </form>
              ) : null}
            </nav>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
