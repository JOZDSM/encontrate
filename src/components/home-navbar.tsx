"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Menu } from "lucide-react";
import { Poppins } from "next/font/google";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { signOutAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EncontrateMark } from "@/components/encontrate-mark";
import { isPublicListingDetailPath } from "@/lib/listing-route";
import { cn } from "@/lib/utils";

const logo = Poppins({
  weight: "500",
  subsets: ["latin"],
});

function isBuscarHabitacionPath(p: string | null): boolean {
  return Boolean(p && (p === "/listings" || p.startsWith("/listings/")));
}

function isCargaHabitacionPath(p: string | null): boolean {
  return Boolean(
    p &&
      (p === "/host/listings/new" ||
        /^\/host\/listings\/[^/]+\/edit$/.test(p)),
  );
}

function isMisCosasPath(p: string | null): boolean {
  return Boolean(p && p.startsWith("/mis-cosas"));
}

type TopOffset = "none" | "banner";

export function HomeNavbar({ topOffset = "none" }: { topOffset?: TopOffset } = {}) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const showPanel = status === "authenticated" && session?.user;
  const designPreview = Boolean(session?.user?.designPreview);
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);
  const plainBackground = isPublicListingDetailPath(pathname);

  const buscarActive = isBuscarHabitacionPath(pathname);
  const cargarActive = isCargaHabitacionPath(pathname);
  const misCosasActive = isMisCosasPath(pathname);

  const desktopNavItem = (active: boolean) =>
    cn(
      "whitespace-nowrap underline-offset-4 hover:underline hover:underline-offset-4",
      active && "underline",
    );

  const mobileNavItem = (active: boolean) =>
    cn(
      "rounded-lg px-3 py-3 text-base font-semibold hover:bg-muted",
      active && "bg-muted",
    );

  return (
    <>
      <header
        className={cn(
          "fixed right-0 left-0 z-[100] flex h-20 flex-col items-center justify-center border-b border-border px-4 md:h-28",
          topOffset === "banner" ? "top-10 md:top-12" : "top-0",
          "transition-[top,border-color] duration-300 ease-out",
          "md:border-transparent md:hover:border-border md:focus-within:border-border",
          plainBackground ? "bg-background text-foreground" : undefined,
        )}
      >
        <div className="flex w-full max-w-[1440px] items-center justify-between">
          <Link
            href="/"
            className={cn(
              logo.className,
              "inline-flex items-center gap-2 text-2xl leading-8",
              plainBackground
                ? "text-foreground"
                : "text-primary-foreground dark:text-foreground",
            )}
            onClick={(e) => {
              if (pathname === "/") {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
          >
            <EncontrateMark className="size-8 shrink-0" />
            encontrate
          </Link>

          <div className="hidden flex-wrap items-center justify-end gap-3 md:flex lg:gap-4">
            <nav
              className={cn(
                "flex max-w-2xl flex-wrap items-center justify-end gap-x-2 gap-y-1 text-sm font-semibold sm:gap-x-4",
                plainBackground
                  ? "text-foreground"
                  : "text-primary-foreground dark:text-foreground",
              )}
            >
              <Link
                href="/listings"
                className={desktopNavItem(buscarActive)}
                aria-current={buscarActive ? "page" : undefined}
              >
                Buscá habitación
              </Link>
              <Link
                href="/host/listings/new"
                className={desktopNavItem(cargarActive)}
                aria-current={cargarActive ? "page" : undefined}
              >
                Cargá habitación
              </Link>
              {showPanel ? (
                <Link
                  href="/mis-cosas/mensajes"
                  className={desktopNavItem(misCosasActive)}
                  aria-current={misCosasActive ? "page" : undefined}
                >
                  Panel
                </Link>
              ) : null}
            </nav>

            <div className="flex flex-wrap items-center justify-end gap-2">
              {!showPanel ? (
                <Button asChild size="default" variant="secondary" className="rounded-full shadow-xs">
                  <Link href="/login">Iniciá sesión / Registrate</Link>
                </Button>
              ) : null}

              {showPanel ? (
                designPreview ? (
                  <span
                    className={cn(
                      "max-w-[10rem] text-xs leading-snug",
                      plainBackground
                        ? "text-muted-foreground"
                        : "text-primary-foreground/80 dark:text-foreground/80",
                    )}
                  >
                    Modo diseño (local)
                  </span>
                ) : (
                  <form action={signOutAction}>
                    <Button
                      type="submit"
                      size="default"
                      variant="outline"
                      className="rounded-full border-primary-foreground/35 bg-transparent text-primary-foreground shadow-xs hover:bg-primary-foreground/10 dark:border-foreground/35 dark:text-foreground dark:hover:bg-foreground/10"
                    >
                      Cerrar sesión
                    </Button>
                  </form>
                )
              ) : null}

              <Button
                asChild
                size="default"
                variant="secondary"
                className="rounded-full bg-brand-background text-primary-foreground shadow-xs hover:bg-brand-background/90"
              >
                <Link href="/contacto">Contacto</Link>
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="text-primary-foreground hover:bg-primary-foreground/10 dark:text-foreground dark:hover:bg-foreground/10"
              asChild
            >
              <Link
                href={showPanel ? "/mis-cosas/mensajes" : "/login"}
                aria-label={
                  showPanel ? "Ir a mensajes" : "Iniciar sesión o registro"
                }
              >
                <Bell className="size-6" strokeWidth={2} />
              </Link>
            </Button>
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
          <nav className="flex flex-col gap-1">
            <Link
              href="/listings"
              className={mobileNavItem(buscarActive)}
              aria-current={buscarActive ? "page" : undefined}
              onClick={closeMenu}
            >
              Buscá habitación
            </Link>
            <Link
              href="/host/listings/new"
              className={mobileNavItem(cargarActive)}
              aria-current={cargarActive ? "page" : undefined}
              onClick={closeMenu}
            >
              Cargá habitación
            </Link>
            <div className="my-2 h-px bg-border" />
            {showPanel ? (
              <Link
                href="/mis-cosas/mensajes"
                className={mobileNavItem(misCosasActive)}
                aria-current={misCosasActive ? "page" : undefined}
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
            {showPanel ? (
              designPreview ? (
                <p className="text-muted-foreground px-3 pt-1 text-xs">
                  Modo diseño local — sin sesión real.
                </p>
              ) : (
                <form action={signOutAction} className="pt-1">
                  <Button type="submit" variant="outline" className="w-full">
                    Cerrar sesión
                  </Button>
                </form>
              )
            ) : null}
          </nav>
        </DialogContent>
      </Dialog>
    </>
  );
}
