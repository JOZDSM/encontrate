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
import { cn } from "@/lib/utils";

const logo = Poppins({
  weight: "500",
  subsets: ["latin"],
});

export function HomeNavbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const showPanel = status === "authenticated" && session?.user;
  const isAdmin = Boolean(session?.user?.isAdmin);
  const designPreview = Boolean(session?.user?.designPreview);
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 right-0 left-0 z-30 flex h-20 flex-col items-center justify-center border-b border-border px-4 md:h-28",
          "transition-[border-color] duration-300 ease-out",
          "md:border-transparent md:hover:border-border md:focus-within:border-border",
          "bg-background text-foreground",
        )}
      >
        <div className="flex w-full max-w-[1440px] items-center justify-between">
          <Link
            href="/"
            className={cn(
              logo.className,
              "inline-flex items-center gap-2 text-2xl leading-8 text-foreground",
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
            <nav className="flex max-w-2xl flex-wrap items-center justify-end gap-x-2 gap-y-1 text-sm font-semibold text-foreground sm:gap-x-4">
              <Link
                href="/listings"
                className="whitespace-nowrap hover:underline hover:underline-offset-4"
              >
                Buscá habitación
              </Link>
              <Link
                href="/host/listings/new"
                className="whitespace-nowrap hover:underline hover:underline-offset-4"
              >
                Cargá habitación
              </Link>
              {showPanel ? (
                <>
                  <Link
                    href="/host/listings"
                    className="whitespace-nowrap hover:underline hover:underline-offset-4"
                  >
                    Mis anuncios
                  </Link>
                  <Link
                    href="/host/bookings"
                    className="whitespace-nowrap hover:underline hover:underline-offset-4"
                  >
                    Solicitudes
                  </Link>
                  {isAdmin ? (
                    <Link
                      href="/admin"
                      className="whitespace-nowrap hover:underline hover:underline-offset-4"
                    >
                      Admin
                    </Link>
                  ) : null}
                </>
              ) : null}
            </nav>

            <div className="flex flex-wrap items-center justify-end gap-2">
              {showPanel ? (
                <Button asChild size="default" variant="secondary" className="rounded-full shadow-xs">
                  <Link href="/dashboard">Mi panel</Link>
                </Button>
              ) : (
                <Button asChild size="default" variant="secondary" className="rounded-full shadow-xs">
                  <Link href="/login">Iniciá sesión / Registrate</Link>
                </Button>
              )}

              {showPanel ? (
                designPreview ? (
                  <span className="max-w-[10rem] text-xs leading-snug text-muted-foreground">
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
                href={showPanel ? "/dashboard" : "/login"}
                aria-label={
                  showPanel ? "Ir al panel" : "Iniciar sesión o registro"
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
              className="rounded-lg px-3 py-3 text-base font-semibold hover:bg-muted"
              onClick={closeMenu}
            >
              Buscá habitación
            </Link>
            <Link
              href="/host/listings/new"
              className="rounded-lg px-3 py-3 text-base font-semibold hover:bg-muted"
              onClick={closeMenu}
            >
              Cargá habitación
            </Link>
            <div className="my-2 h-px bg-border" />
            {showPanel ? (
              <>
                <Link
                  href="/dashboard"
                  className="rounded-lg px-3 py-3 text-base font-semibold hover:bg-muted"
                  onClick={closeMenu}
                >
                  Mi panel
                </Link>
                <Link
                  href="/host/listings"
                  className="rounded-lg px-3 py-3 text-base font-semibold hover:bg-muted"
                  onClick={closeMenu}
                >
                  Mis anuncios
                </Link>
                <Link
                  href="/host/bookings"
                  className="rounded-lg px-3 py-3 text-base font-semibold hover:bg-muted"
                  onClick={closeMenu}
                >
                  Solicitudes
                </Link>
                {isAdmin ? (
                  <Link
                    href="/admin"
                    className="rounded-lg px-3 py-3 text-base font-semibold hover:bg-muted"
                    onClick={closeMenu}
                  >
                    Admin
                  </Link>
                ) : null}
              </>
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
