"use client";

import type { ReactNode } from "react";
import type { ServiceContactOption } from "@/lib/catalogue-analytics";
import { captureServiceOutboundClicked } from "@/lib/catalogue-analytics";
import { cn } from "@/lib/utils";

export function ServiceOutboundLink({
  href,
  option,
  serviceId,
  slug,
  title,
  professionalName,
  catalogueSurface,
  className,
  ariaLabel,
  children,
}: {
  href: string;
  option: Extract<ServiceContactOption, "instagram" | "website">;
  serviceId: string;
  slug: string;
  title: string;
  professionalName: string;
  catalogueSurface: string;
  className?: string;
  ariaLabel?: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
      className={cn(className)}
      onClick={() =>
        captureServiceOutboundClicked(
          { serviceId, slug, title, professionalName },
          option,
          catalogueSurface,
        )
      }
    >
      {children}
    </a>
  );
}
