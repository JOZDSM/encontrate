import {
  captureServiceContactOpenedDual,
  captureServiceContactOptionClickedDual,
  type ServiceContactOption,
  type ServiceContactSurface,
} from "@/lib/catalogue-analytics";

export type { ServiceContactOption, ServiceContactSurface };

export type ServiceContactAnalyticsMeta = {
  title?: string;
  professionalName?: string;
};

export function captureServiceContactOpened(
  serviceId: string,
  slug: string,
  surface: ServiceContactSurface,
  meta?: ServiceContactAnalyticsMeta,
) {
  captureServiceContactOpenedDual(
    {
      serviceId,
      slug,
      title: meta?.title,
      professionalName: meta?.professionalName,
    },
    surface,
  );
}

export function captureServiceContactOptionClicked(
  serviceId: string,
  slug: string,
  option: ServiceContactOption,
  surface: ServiceContactSurface,
  meta?: ServiceContactAnalyticsMeta,
) {
  captureServiceContactOptionClickedDual(
    {
      serviceId,
      slug,
      title: meta?.title,
      professionalName: meta?.professionalName,
    },
    option,
    surface,
  );
}
