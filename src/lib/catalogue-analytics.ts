import posthog from "posthog-js";
import { gaEvent } from "@/lib/ga";

export type ServiceContactOption =
  | "whatsapp"
  | "email"
  | "instagram"
  | "website";

export type ServiceContactSurface = "hero" | "description";

/** Shared dimensions for filtering provider reports in GA4 / Looker Studio. */
export type ServiceAnalyticsProps = {
  serviceId: string;
  slug: string;
  title?: string;
  professionalName?: string;
};

function serviceParams(service: ServiceAnalyticsProps) {
  return {
    service_id: service.serviceId,
    service_slug: service.slug,
    service_title: service.title,
    professional_name: service.professionalName,
  };
}

export function captureServiceCardClicked(
  service: ServiceAnalyticsProps,
  catalogueSurface: string,
) {
  const params = {
    ...serviceParams(service),
    catalogue_surface: catalogueSurface,
  };
  gaEvent("service_card_clicked", params);
}

export function captureServicePageView(service: ServiceAnalyticsProps) {
  const params = serviceParams(service);
  gaEvent("service_page_view", params);
}

export function captureServiceContactOpenedGa(
  service: ServiceAnalyticsProps,
  surface: ServiceContactSurface,
) {
  gaEvent("service_contact_opened", {
    ...serviceParams(service),
    catalogue_surface: surface,
  });
}

export function captureServiceContactOptionClickedGa(
  service: ServiceAnalyticsProps,
  option: ServiceContactOption,
  surface: ServiceContactSurface,
) {
  gaEvent("service_contact_option_clicked", {
    ...serviceParams(service),
    catalogue_surface: surface,
    contact_option: option,
  });
}

export function captureServiceOutboundClicked(
  service: ServiceAnalyticsProps,
  option: Extract<ServiceContactOption, "instagram" | "website">,
  catalogueSurface: string,
) {
  gaEvent("service_outbound_clicked", {
    ...serviceParams(service),
    catalogue_surface: catalogueSurface,
    contact_option: option,
  });
}

export function captureServiceShareClicked(service: ServiceAnalyticsProps) {
  gaEvent("service_share_clicked", serviceParams(service));
}

export function captureCatalogueSearchOpened() {
  gaEvent("catalogue_search_opened");
}

export function captureCatalogueSearchResultClicked(
  service: ServiceAnalyticsProps,
) {
  const params = {
    ...serviceParams(service),
    catalogue_surface: "search",
  };
  gaEvent("catalogue_search_result_clicked", params);
  gaEvent("service_card_clicked", params);
}

/** Dual-write Contactar open to PostHog + GA4. */
export function captureServiceContactOpenedDual(
  service: ServiceAnalyticsProps,
  surface: ServiceContactSurface,
) {
  posthog.capture("service_contact_opened", {
    service_id: service.serviceId,
    slug: service.slug,
    surface,
  });
  captureServiceContactOpenedGa(service, surface);
}

/** Dual-write Contactar option click to PostHog + GA4. */
export function captureServiceContactOptionClickedDual(
  service: ServiceAnalyticsProps,
  option: ServiceContactOption,
  surface: ServiceContactSurface,
) {
  posthog.capture("service_contact_option_clicked", {
    service_id: service.serviceId,
    slug: service.slug,
    option,
    surface,
  });
  captureServiceContactOptionClickedGa(service, option, surface);
}
