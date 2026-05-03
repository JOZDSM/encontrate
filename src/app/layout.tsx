import type { Metadata } from "next";
import { Figtree, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import { SiteChrome } from "@/components/site-chrome";
import { SiteFooter } from "@/components/site-footer";
import { auth } from "@/auth";
import "./globals.css";
import { cn } from "@/lib/utils";

const figtree = Figtree({ subsets: ["latin"], variable: "--font-sans" });

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Encontrate",
    template: "%s · Encontrate",
  },
  description:
    "Coordina estancias en habitaciones en Barcelona: anuncios, solicitudes y mensajes. Sin pagos en la plataforma.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html
      lang="es"
      className={cn(
        "dark",
        "h-svh min-h-0 antialiased font-sans",
        figtree.variable,
        geistMono.variable,
      )}
    >
      <body className="flex h-svh min-h-0 flex-col overflow-x-hidden overflow-y-auto bg-background md:overflow-y-hidden">
        <Providers session={session}>
          <SiteChrome>
            <main className="flex min-h-0 flex-1 flex-col overflow-visible pt-20 md:overflow-hidden md:pt-28">
              <div className="flex min-h-0 flex-1 flex-col overflow-visible md:overflow-y-auto md:overscroll-y-contain md:pb-4">
                <div className="flex min-h-0 flex-1 flex-col">{children}</div>
                <div className="shrink-0 md:hidden">
                  <SiteFooter />
                </div>
              </div>
              <div className="hidden shrink-0 md:block">
                <SiteFooter />
              </div>
            </main>
          </SiteChrome>
        </Providers>
      </body>
    </html>
  );
}
