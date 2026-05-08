import type { Metadata, Viewport } from "next";
import { Figtree, Geist_Mono, Inter } from "next/font/google";
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

// Inter is used only for the Barcelona neighborhood map labels (matching the
// Figma design). Adding it here makes `var(--font-map-labels)` available in
// CSS without re-fetching the font on each render.
const inter = Inter({
  variable: "--font-map-labels",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL(
    (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(
      /\/$/,
      "",
    ),
  ),
  title: {
    default: "Encontrate",
    template: "%s · Encontrate",
  },
  description:
    "Coordina estancias en habitaciones en Barcelona: anuncios, solicitudes y mensajes. Sin pagos en la plataforma.",
  openGraph: {
    type: "website",
    locale: "es_ES",
    siteName: "Encontrate",
    title: "Encontrate",
    description:
      "Coordina estancias en habitaciones en Barcelona: anuncios, solicitudes y mensajes. Sin pagos en la plataforma.",
    images: [
      {
        url: "/open-graph-image.png",
        width: 1200,
        height: 630,
        alt: "Encontrate",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Encontrate",
    description:
      "Coordina estancias en habitaciones en Barcelona: anuncios, solicitudes y mensajes. Sin pagos en la plataforma.",
    images: ["/open-graph-image.png"],
  },
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
        inter.variable,
      )}
    >
      <body className="flex h-svh min-h-0 flex-col overflow-x-hidden overflow-y-auto bg-background md:overflow-y-hidden">
        <Providers session={session}>
          <SiteChrome>
            <main className="flex min-h-0 flex-1 flex-col overflow-visible pt-20 md:overflow-hidden md:pt-28">
              <div className="flex min-h-0 flex-1 flex-col overflow-visible md:border-t md:border-b md:border-sidebar-border md:overflow-y-auto md:overscroll-y-contain">
                <div className="flex flex-1 flex-col md:min-h-0">{children}</div>
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
