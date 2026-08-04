import type { Metadata, Viewport } from "next";
import { Figtree, Geist_Mono, Inter } from "next/font/google";
import { Providers } from "@/components/providers";
import { SiteChrome } from "@/components/site-chrome";
import { SiteHomeDocumentScroll } from "@/components/site-home-document-scroll";
import { SiteMainContent } from "@/components/site-main-content";
import { SiteMainScrollBand } from "@/components/site-main-scroll-band";
import { SiteMainShell } from "@/components/site-main-shell";
import { SiteInBandFooter, SiteOutsideFooter } from "@/components/site-page-footers";
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
        url: "/open-graph-image-2026.png",
        width: 1201,
        height: 631,
        alt: "Encontrate",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Encontrate",
    description:
      "Coordina estancias en habitaciones en Barcelona: anuncios, solicitudes y mensajes. Sin pagos en la plataforma.",
    images: ["/open-graph-image-2026.png"],
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
            <SiteHomeDocumentScroll />
            <SiteMainShell>
              <SiteMainScrollBand>
                <SiteMainContent>{children}</SiteMainContent>
                <SiteInBandFooter />
              </SiteMainScrollBand>
              <SiteOutsideFooter />
            </SiteMainShell>
          </SiteChrome>
        </Providers>
      </body>
    </html>
  );
}
