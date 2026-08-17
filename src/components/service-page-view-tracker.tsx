"use client";

import { useEffect } from "react";
import { captureServicePageView } from "@/lib/catalogue-analytics";

/** Fires `service_page_view` once when a service detail page mounts. */
export function ServicePageViewTracker({
  serviceId,
  slug,
  title,
  professionalName,
}: {
  serviceId: string;
  slug: string;
  title: string;
  professionalName: string;
}) {
  useEffect(() => {
    captureServicePageView({
      serviceId,
      slug,
      title,
      professionalName,
    });
  }, [serviceId, slug, title, professionalName]);

  return null;
}
