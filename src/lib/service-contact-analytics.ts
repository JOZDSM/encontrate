import posthog from "posthog-js";

export type ServiceContactOption =
  | "whatsapp"
  | "email"
  | "instagram"
  | "website";

export type ServiceContactSurface = "hero" | "description";

export function captureServiceContactOpened(
  serviceId: string,
  slug: string,
  surface: ServiceContactSurface,
) {
  posthog.capture("service_contact_opened", {
    service_id: serviceId,
    slug,
    surface,
  });
}

export function captureServiceContactOptionClicked(
  serviceId: string,
  slug: string,
  option: ServiceContactOption,
  surface: ServiceContactSurface,
) {
  posthog.capture("service_contact_option_clicked", {
    service_id: serviceId,
    slug,
    option,
    surface,
  });
}
