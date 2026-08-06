import Link from "next/link";
import { ArrowLeft, Globe, Instagram, Star } from "lucide-react";
import { EncontrateHeroBadge } from "@/components/encontrate-hero-badge";
import { heroCtaClassName } from "@/components/hero-location-cta";
import { ServiceCard } from "@/components/service-card";
import { ServiceContactDialog } from "@/components/service-contact-dialog";
import { ServiceShareButton } from "@/components/service-share-button";
import { SiteFooter } from "@/components/site-footer";
import type { ServiceDetail, ServiceWithCategory } from "@/lib/service-catalog";
import { toServiceOffering } from "@/lib/service-catalog";
import { HOME_PAGE_GUTTER_CLASS } from "@/lib/home-catalog-layout";
import { cn } from "@/lib/utils";

/** Approx. half the hero info block height — keeps the block vertically centered. */
const HERO_INFO_TOP_SPACER =
  "h-[calc(50svh-4.5rem)] md:h-[calc(50svh-5.5rem)]";

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
  similares: ServiceWithCategory[];
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
    <div className="relative bg-black text-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-svh overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={service.imageUrl}
          alt=""
          className="absolute inset-0 size-full object-cover object-top"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, #000000 0%, #000000 25%, rgba(0, 0, 0, 0) 70%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, color-mix(in oklab, var(--background) 80%, transparent) 0%, color-mix(in oklab, var(--background) 40%, transparent) 30%, transparent 50%)",
          }}
        />
      </div>

      <div
        className={cn(
          "absolute inset-x-0 top-0 z-20 flex items-center justify-between gap-3 pt-28 md:pt-36",
          HOME_PAGE_GUTTER_CLASS,
        )}
      >
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-white/90 transition-colors hover:text-white"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Volver
        </Link>
        <ServiceShareButton
          title={service.professionalName}
          text={`${service.professionalName} · ${service.title}`}
        />
      </div>

      <div className="relative z-10">
        <div className={HERO_INFO_TOP_SPACER} aria-hidden />

        <div className={HOME_PAGE_GUTTER_CLASS}>
          <div className="max-w-2xl space-y-4">
            <div className="flex items-center gap-2 text-sm text-white/90">
              <EncontrateHeroBadge
                variant="card"
                className="size-6 max-h-6 max-w-6"
              />
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
                <a
                  href={service.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Sitio web"
                  className={cn(
                    "inline-flex size-8 items-center justify-center",
                    heroCtaClassName,
                  )}
                >
                  <Globe className="size-4" strokeWidth={2} aria-hidden />
                </a>
              ) : null}
              {service.instagramUrl ? (
                <a
                  href={service.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className={cn(
                    "inline-flex size-8 items-center justify-center",
                    heroCtaClassName,
                  )}
                >
                  <Instagram className="size-4" strokeWidth={2} aria-hidden />
                </a>
              ) : null}
              <ServiceContactDialog
                {...contactProps}
                surface="hero"
                triggerClassName={cn(
                  "h-8 gap-1.5 px-3 text-sm font-medium",
                  heroCtaClassName,
                )}
              />
            </div>
          </div>

          <div className="mt-[112px] space-y-12 pb-12 md:space-y-16 md:pb-16">
            <section className="space-y-3">
              <h2 className="text-xl font-semibold">Descripción</h2>
              <div className="flex flex-col gap-8 md:flex-row md:items-start">
                <p className="max-w-2xl whitespace-pre-line text-base leading-relaxed text-white/85">
                  {service.description}
                </p>
                <aside className="flex shrink-0 flex-col items-start gap-3 md:pl-6">
                  <ServiceContactDialog
                    {...contactProps}
                    surface="description"
                    triggerClassName="h-auto gap-2 rounded-none bg-transparent p-0 text-base font-medium text-white shadow-none hover:bg-transparent hover:text-white/80"
                  />
                  {service.instagramUrl ? (
                    <a
                      href={service.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-base font-medium text-white hover:text-white/80"
                    >
                      <Instagram className="size-4" strokeWidth={2} aria-hidden />
                      {service.instagramHandle || "Instagram"}
                    </a>
                  ) : null}
                </aside>
              </div>
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
                      <div className="flex shrink-0 flex-col items-center gap-1 self-center">
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
        </div>
      </div>

      {similares.length > 0 ? (
        <section className="relative z-10 space-y-4 pb-12 md:pb-16">
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

      <div className="relative z-10 border-t border-white/10">
        <SiteFooter />
      </div>
    </div>
  );
}
