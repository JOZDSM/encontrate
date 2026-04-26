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
import { cn } from "@/lib/utils";

const logo = Poppins({
  weight: "500",
  subsets: ["latin"],
});

function EncontrateMark(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 571.75 571.75"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d="M359.72,237.375c.07.1.14.21.2.31-.2.1-.4.2-.6.3.13-.2.27-.41.4-.61ZM212.04,237.375c-.08.1-.14.21-.21.31.21.1.41.2.61.3-.14-.2-.27-.41-.4-.61ZM339.25,285.875c0-29.4782-23.8968-53.375-53.375-53.375s-53.375,23.8968-53.375,53.375,23.8968,53.375,53.375,53.375,53.375-23.8968,53.375-53.375ZM232.5,382.875c0,29.43,23.94,53.38,53.38,53.38s53.37-23.95,53.37-53.38c0-8.21-1.86-16-5.19-22.95-13.87,9.06-30.42,14.33-48.18,14.33s-34.32-5.27-48.19-14.33c-3.33,6.95-5.19,14.74-5.19,22.95ZM382.875,339.25c29.43,0,53.38-23.94,53.38-53.38,0-29.43-23.95-53.37-53.38-53.37-8.21,0-16,1.86-22.95,5.19,9.06,13.87,14.33,30.42,14.33,48.18,0,17.76-5.27,34.32-14.33,48.19,6.95,3.33,14.74,5.19,22.95,5.19ZM339.25,188.875c0-29.43-23.94-53.38-53.38-53.38-29.43,0-53.37,23.95-53.37,53.38,0,8.21,1.86,16,5.19,22.95,13.87-9.06,30.42-14.33,48.18-14.33s34.32,5.27,48.19,14.33c3.33-6.95,5.19-14.74,5.19-22.95ZM188.875,232.5c-29.43,0-53.38,23.94-53.38,53.38,0,29.43,23.95,53.37,53.38,53.37,8.21,0,16-1.86,22.95-5.19-9.06-13.87-14.33-30.42-14.33-48.18,0-17.76,5.27-34.32,14.33-48.19-6.95-3.33-14.74-5.19-22.95-5.19ZM359.72,334.375c.07-.11.14-.21.21-.32-.21-.1-.42-.2-.62-.31.14.21.27.42.41.63ZM285.875,0l285.875,285.875-285.875,285.875L0,285.875,285.875,0ZM285.88,100.495c-48.73,0-88.38,39.65-88.38,88.38,0,3.07.16,6.1.47,9.09-2.99-.31-6.02-.47-9.09-.47-48.73,0-88.38,39.65-88.38,88.38s39.65,88.38,88.38,88.38c3.07,0,6.1-.16,9.09-.47-.31,2.9901-.47,6.02-.47,9.09,0,48.73,39.64,88.38,88.38,88.38s88.37-39.65,88.37-88.38c0-3.07-.16-6.11-.47-9.1,2.99.31,6.03.47,9.1.47,48.72,0,88.37-39.64,88.37-88.37s-39.65-88.38-88.37-88.38c-3.07,0-6.11.16-9.1.47.31-2.9901.47-6.02.47-9.09,0-48.73-39.64-88.38-88.37-88.38ZM237.69,211.825,334.38,212.035c-.11-.08-.21-.15-.32-.21-.1.21-.2.42-.31.62.21-.14.42-.28.63-.41ZM212.43,333.775c-.2.1-.4.19-.6.29.07.1.13.21.2.31.1299-.2.2599-.4.4-.6ZM285.875,285.875" />
    </svg>
  );
}

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
        )}
      >
        <div className="flex w-full max-w-[1440px] items-center justify-between">
          <Link
            href="/"
            className={cn(
              logo.className,
              "text-primary-foreground inline-flex items-center gap-2 text-2xl leading-8 dark:text-foreground",
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
            <nav className="flex max-w-2xl flex-wrap items-center justify-end gap-x-2 gap-y-1 text-sm font-semibold text-primary-foreground dark:text-foreground sm:gap-x-4">
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
                  <span className="text-primary-foreground/80 max-w-[10rem] text-xs leading-snug dark:text-foreground/80">
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
                      Salir
                    </Button>
                  </form>
                )
              ) : null}

              <Button
                asChild
                size="default"
                className="rounded-full border-0 bg-brand-background text-primary-foreground shadow-xs hover:bg-brand-background/90"
              >
                <Link href="/aviso">Contacto</Link>
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-4 md:hidden">
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
              href="/aviso"
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
                    Salir
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
