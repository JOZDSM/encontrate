"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { gaPageview, getGaMeasurementId } from "@/lib/ga";

/**
 * Loads gtag.js and sends SPA pageviews on App Router navigations.
 * Skips entirely when `NEXT_PUBLIC_GA_MEASUREMENT_ID` is missing.
 */
export function GoogleAnalytics({ enabled = true }: { enabled?: boolean }) {
  const measurementId = getGaMeasurementId();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!enabled || !measurementId || !ready) return;
    const url =
      pathname + (searchParams?.toString() ? `?${searchParams}` : "");
    gaPageview(url);
  }, [pathname, searchParams, enabled, measurementId, ready]);

  if (!enabled || !measurementId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
        onLoad={() => setReady(true)}
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${measurementId}', { send_page_view: false });
        `}
      </Script>
    </>
  );
}
