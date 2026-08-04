import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { EncontrateHeroBadge } from "@/components/encontrate-hero-badge";
import { Card } from "@/components/ui/card";
import type { ServiceOffering } from "@/lib/mock-services-catalog";
import { cn } from "@/lib/utils";

export function ServiceCard({
  service,
  variant = "tile",
  className,
}: {
  service: ServiceOffering;
  variant?: "tile" | "detail";
  className?: string;
}) {
  const locality = [service.neighborhood, service.priceNote]
    .filter(Boolean)
    .join(" · ");

  const href = service.slug ? `/${service.slug}` : undefined;

  if (variant === "tile") {
    const card = (
      <div
        data-service-id={service.id}
        className={cn(
          "group/service-card relative h-[304px] w-[512px] overflow-hidden rounded-none bg-black text-white",
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
            className="absolute inset-0 size-full object-cover object-center"
          />
        ) : null}

        <div className="service-card-scrim absolute inset-0" aria-hidden />

        <EncontrateHeroBadge
          variant="card"
          className="absolute top-4 right-4 z-10"
        />

        <div className="relative z-10 flex h-full flex-col justify-center gap-3 p-4 pr-24">
          <div className="space-y-1">
            <h3 className="text-2xl leading-snug font-semibold text-balance text-white">
              {service.professionalName}
            </h3>
            <p className="text-base text-white/90">{service.title}</p>
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
