/** GA4 helpers. No-ops when `NEXT_PUBLIC_GA_MEASUREMENT_ID` is unset or gtag is not ready. */

export type GaParamValue = string | number | boolean | undefined | null;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function getGaMeasurementId(): string | null {
  const id = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();
  return id || null;
}

export function gaPageview(url: string) {
  const id = getGaMeasurementId();
  if (!id || typeof window === "undefined" || typeof window.gtag !== "function") {
    return;
  }
  window.gtag("config", id, { page_path: url });
}

export function gaEvent(
  name: string,
  params?: Record<string, GaParamValue>,
) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") {
    return;
  }
  if (!getGaMeasurementId()) return;

  const cleaned: Record<string, string | number | boolean> = {};
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null) continue;
      cleaned[key] = value;
    }
  }
  window.gtag("event", name, cleaned);
}
