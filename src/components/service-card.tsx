"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { EncontrateHeroBadge } from "@/components/encontrate-hero-badge";
import { Card } from "@/components/ui/card";
import { captureServiceCardClicked } from "@/lib/catalogue-analytics";
import type { ServiceOffering } from "@/lib/mock-services-catalog";
import { cn } from "@/lib/utils";

export function ServiceCard({
  service,
  variant = "tile",
  catalogueSurface = "unknown",
  className,
}: {
  service: ServiceOffering;
  variant?: "tile" | "detail";
  /** Where the card was shown (recommended, category slug, similar, …). */
  catalogueSurface?: string;
  className?: string;
}) {
  const locality = [service.neighborhood, service.priceNote]
    .filter(Boolean)
    .join(" · ");

  const href = service.slug ? `/${service.slug}` : undefined;

  function onCardNavigate() {
    if (!service.slug) return;
    captureServiceCardClicked(
      {
        serviceId: service.id,
        slug: service.slug,
        title: service.title,
        professionalName: service.professionalName,
      },
      catalogueSurface,
    );
  }

  if (variant === "tile") {
    const card = (
      <div
        data-service-id={service.id}
        className={cn(
          "group/service-card relative h-[216px] w-[160px] overflow-hidden rounded-none bg-black text-white md:h-[304px] md:w-[512px]",
          href ? "cursor-pointer" : null,
          className,
        )}
      >
        {service.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={service.imageUrl}
            alt=""
            decoding="async"
            className="absolute top-0 -right-8 h-full w-[256px] max-w-none object-cover object-[72%_center] md:inset-0 md:right-0 md:size-full md:w-full md:object-center"
          />
        ) : null}

        <div className="service-card-scrim absolute inset-0" aria-hidden />

        <EncontrateHeroBadge
          variant="card"
          className="absolute top-2 right-2 z-10 size-5 max-h-5 max-w-5 md:top-4 md:right-4 md:size-auto md:max-h-none md:max-w-none"
        />

        <div className="relative z-10 flex h-full flex-col justify-end gap-1.5 p-3 pr-2 md:justify-center md:gap-3 md:p-4 md:pr-24">
          <div className="min-w-0 space-y-0.5 md:space-y-1">
            <h3 className="text-base leading-snug font-semibold text-balance text-white md:text-2xl">
              {service.professionalName}
            </h3>
            <p className="truncate text-xs text-white/90 md:text-base">
              {service.title}
            </p>
          </div>

          <div className="service-card-cta" aria-hidden>
            <ArrowRight className="size-4 shrink-0" strokeWidth={1.5} />
          </div>
        </div>
      </div>
    );

    if (!href) return card;

    return (
      <Link
        href={href}
        onClick={onCardNavigate}
        className="block outline-none focus-visible:ring-2 focus-visible:ring-white/70"
        aria-label={`${service.professionalName}, ${service.title}`}
      >
        {card}
      </Link>
    );
  }

  return (
    <Card
      data-service-id={service.id}
      size="sm"
      className={cn(
        "h-full cursor-pointer gap-0 bg-card py-0 transition-shadow hover:shadow-md",
        className,
      )}
    >
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-xs font-medium text-muted-foreground">{service.category}</p>
        <h3 className="text-base leading-snug font-semibold text-card-foreground">
          {service.title}
        </h3>
        <p className="text-sm text-muted-foreground">{service.professionalName}</p>
        {locality ? (
          <p className="mt-auto text-xs text-muted-foreground">{locality}</p>
        ) : null}
      </div>
    </Card>
  );
}
