import Link from "next/link";
import { ArrowLeft, Globe, Instagram, Star } from "lucide-react";
import { EncontrateHeroBadge } from "@/components/encontrate-hero-badge";
import { ServiceCard } from "@/components/service-card";
import { ServiceContactDialog } from "@/components/service-contact-dialog";
import { ServiceShareButton } from "@/components/service-share-button";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import type { ServiceDetail } from "@/lib/service-catalog";
import { toServiceOffering } from "@/lib/service-catalog";
import type { Service } from "@/generated/prisma/client";
import { HOME_PAGE_GUTTER_CLASS } from "@/lib/home-catalog-layout";
import { cn } from "@/lib/utils";

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} de 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={cn(
            "size-3.5",
            i < rating
              ? "fill-brand-background text-brand-background"
              : "text-white/25",
          )}
          aria-hidden
        />
      ))}
    </div>
  );
}

export function ServiceDetailPage({
  service,
  similares,
}: {
  service: ServiceDetail;
  similares: Service[];
}) {
  const contactProps = {
    serviceId: service.id,
    slug: service.slug,
    whatsapp: service.whatsapp,
    email: service.email,
    showWhatsapp: service.showWhatsapp,
    showEmail: service.showEmail,
    websiteUrl: service.websiteUrl,
    instagramUrl: service.instagramUrl,
    instagramHandle: service.instagramHandle,
  };

  return (
    <div className="bg-black text-white">
      <section className="relative min-h-[70svh] w-full overflow-hidden md:min-h-[75svh]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={service.imageUrl}
          alt=""
          className="absolute inset-0 size-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-black/20" />

        <div
          className={cn(
            "relative z-10 flex min-h-[70svh] flex-col justify-between py-6 md:min-h-[75svh] md:py-8",
            HOME_PAGE_GUTTER_CLASS,
          )}
        >
          <div className="flex items-center justify-between gap-3 pt-16 md:pt-20">
            <Button
              asChild
              size="sm"
              variant="secondary"
              className="rounded-full bg-black/40 text-white backdrop-blur-sm hover:bg-black/55"
            >
              <Link href="/">
                <ArrowLeft className="size-4" aria-hidden />
                Volver
              </Link>
            </Button>
            <ServiceShareButton
              title={service.professionalName}
              text={`${service.professionalName} · ${service.title}`}
            />
          </div>

          <div className="max-w-2xl space-y-4 pb-8 md:pb-12">
            <div className="flex items-center gap-2 text-sm text-white/90">
              <EncontrateHeroBadge variant="card" className="size-6 max-h-6 max-w-6" />
              <span>Recomendado por miembros de Encontrate.</span>
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tight text-balance md:text-5xl">
                {service.professionalName}
              </h1>
              <p className="text-lg text-white/90 md:text-xl">{service.title}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              {service.websiteUrl ? (
                <Button
                  asChild
                  size="icon"
                  variant="secondary"
                  className="rounded-full bg-white text-black hover:bg-white/90"
                >
                  <a
                    href={service.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Sitio web"
                  >
                    <Globe className="size-4" />
                  </a>
                </Button>
              ) : null}
              {service.instagramUrl ? (
                <Button
                  asChild
                  size="icon"
                  variant="secondary"
                  className="rounded-full bg-white text-black hover:bg-white/90"
                >
                  <a
                    href={service.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                  >
                    <Instagram className="size-4" />
                  </a>
                </Button>
              ) : null}
              <ServiceContactDialog
                {...contactProps}
                surface="hero"
                triggerClassName="bg-white text-black hover:bg-white/90"
              />
            </div>
          </div>
        </div>
      </section>

      <div className={cn("space-y-12 py-10 md:space-y-16 md:py-14", HOME_PAGE_GUTTER_CLASS)}>
        <section className="grid gap-8 md:grid-cols-[minmax(0,1fr)_14rem] md:gap-12">
          <div className="space-y-3">
            <h2 className="text-xl font-semibold">Descripción</h2>
            <p className="max-w-2xl whitespace-pre-line text-base leading-relaxed text-white/85">
              {service.description}
            </p>
          </div>
          <aside className="flex flex-col gap-3 md:items-start">
            <ServiceContactDialog
              {...contactProps}
              surface="description"
              triggerClassName="bg-white text-black hover:bg-white/90"
            />
            {service.instagramUrl ? (
              <a
                href={service.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-white/85 underline-offset-4 hover:underline"
              >
                <Instagram className="size-4" aria-hidden />
                {service.instagramHandle || "Instagram"}
              </a>
            ) : null}
          </aside>
        </section>

        {service.offeringItems.length > 0 ? (
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Servicios</h2>
            <ul className="max-w-2xl list-disc space-y-2 pl-5 text-white/85">
              {service.offeringItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        ) : null}

        {service.reviews.length > 0 ? (
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Valoraciones de clientes</h2>
            <ul className="space-y-3">
              {service.reviews.map((review) => (
                <li
                  key={review.id}
                  className="flex items-start gap-4 rounded-2xl bg-white/5 p-4 md:p-5"
                >
                  <div className="size-11 shrink-0 overflow-hidden rounded-full bg-white/10">
                    {review.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={review.avatarUrl}
                        alt=""
                        className="size-full object-cover"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center text-sm font-medium text-white/70">
                        {review.authorName.slice(0, 1)}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="font-medium">{review.authorName}</p>
                    <p className="text-sm leading-relaxed text-white/80">
                      {review.body}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className="text-lg font-semibold leading-none">
                      {review.rating}
                    </span>
                    <Stars rating={review.rating} />
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>

      {similares.length > 0 ? (
        <section className="space-y-4 pb-12 md:pb-16">
          <h2 className={cn("text-xl font-semibold", HOME_PAGE_GUTTER_CLASS)}>
            Similares
          </h2>
          <div className="catalog-h-scroll overflow-x-auto overscroll-x-contain pl-8">
            <ul className="flex w-max gap-4 pr-8">
              {similares.map((item) => (
                <li key={item.id} className="h-[304px] w-[512px] shrink-0">
                  <ServiceCard
                    service={toServiceOffering(item)}
                    variant="tile"
                  />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <div className="border-t border-white/10">
        <SiteFooter />
      </div>
    </div>
  );
}
