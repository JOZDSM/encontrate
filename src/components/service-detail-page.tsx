import Link from "next/link";
import { ArrowLeft, Globe, Instagram, Star } from "lucide-react";
import { EncontrateHeroBadge } from "@/components/encontrate-hero-badge";
import { heroCtaClassName } from "@/components/hero-location-cta";
import { ServiceCard } from "@/components/service-card";
import { ServiceContactDialog } from "@/components/service-contact-dialog";
import {
  ServiceHeroBackground,
  ServiceHeroMobileBackButton,
  ServiceHeroMobileShareButton,
} from "@/components/service-hero-mobile-controls";
import { ServiceOutboundLink } from "@/components/service-outbound-link";
import { ServicePageViewTracker } from "@/components/service-page-view-tracker";
import { ServiceShareButton } from "@/components/service-share-button";
import { SiteFooter } from "@/components/site-footer";
import type { ServiceDetail, ServiceWithCategory } from "@/lib/service-catalog";
import { toServiceOffering } from "@/lib/service-catalog";
import {
  HOME_CATALOG_SCROLL_GUTTER_CLASS,
  HOME_PAGE_GUTTER_CLASS,
} from "@/lib/home-catalog-layout";
import { serviceMobileHeroImageUrl } from "@/lib/service-hero-images";
import { cn } from "@/lib/utils";

/** Approx. half the hero info block height — centers content in the svh hero on desktop. */
const HERO_INFO_TOP_SPACER = "hidden md:block h-[calc(50svh-5.5rem)]";

/** Mobile hero: solid band lower in the 552px frame, then fade. */
const HERO_BOTTOM_GRADIENT_MOBILE = {
  background:
    "linear-gradient(to top, #000000 0%, #000000 25%, rgba(0, 0, 0, 0) 70%)",
};

/** Desktop hero: bottom → top over full svh (0% / 35% / 70% stops). */
const HERO_BOTTOM_GRADIENT_DESKTOP = {
  background:
    "linear-gradient(to top, var(--background) 0%, color-mix(in oklab, var(--background) 70%, transparent) 35%, color-mix(in oklab, var(--background) 0%, transparent) 70%)",
};

const HERO_LEFT_SCRIM = {
  background:
    "linear-gradient(to right, color-mix(in oklab, var(--background) 80%, transparent) 0%, color-mix(in oklab, var(--background) 40%, transparent) 30%, transparent 50%)",
};

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

function ServiceHeroInfo({
  service,
  contactProps,
  outboundBase,
}: {
  service: ServiceDetail;
  contactProps: {
    serviceId: string;
    slug: string;
    title: string;
    professionalName: string;
    whatsapp: string | null;
    email: string | null;
    showWhatsapp: boolean;
    showEmail: boolean;
    websiteUrl: string | null;
    instagramUrl: string | null;
    instagramHandle: string | null;
  };
  outboundBase: {
    serviceId: string;
    slug: string;
    title: string;
    professionalName: string;
  };
}) {
  return (
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
          <ServiceOutboundLink
            href={service.websiteUrl}
            option="website"
            catalogueSurface="hero"
            ariaLabel="Sitio web"
            className={cn(
              "inline-flex size-8 items-center justify-center",
              heroCtaClassName,
            )}
            {...outboundBase}
          >
            <Globe className="size-4" strokeWidth={2} aria-hidden />
          </ServiceOutboundLink>
        ) : null}
        {service.instagramUrl ? (
          <ServiceOutboundLink
            href={service.instagramUrl}
            option="instagram"
            catalogueSurface="hero"
            ariaLabel="Instagram"
            className={cn(
              "inline-flex size-8 items-center justify-center",
              heroCtaClassName,
            )}
            {...outboundBase}
          >
            <Instagram className="size-4" strokeWidth={2} aria-hidden />
          </ServiceOutboundLink>
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
  );
}

export function ServiceDetailPage({
  service,
  similares,
}: {
  service: ServiceDetail;
  similares: ServiceWithCategory[];
}) {
  const mobileHeroUrl = serviceMobileHeroImageUrl(
    service.imageUrl,
    service.imageMobileUrl,
  );

  const contactProps = {
    serviceId: service.id,
    slug: service.slug,
    title: service.title,
    professionalName: service.professionalName,
    whatsapp: service.whatsapp,
    email: service.email,
    showWhatsapp: service.showWhatsapp,
    showEmail: service.showEmail,
    websiteUrl: service.websiteUrl,
    instagramUrl: service.instagramUrl,
    instagramHandle: service.instagramHandle,
  };

  const outboundBase = {
    serviceId: service.id,
    slug: service.slug,
    title: service.title,
    professionalName: service.professionalName,
  };

  const shareProps = {
    title: service.professionalName,
    text: `${service.professionalName} · ${service.title}`,
    serviceId: service.id,
    slug: service.slug,
    serviceTitle: service.title,
    professionalName: service.professionalName,
  };

  return (
    <div className="relative bg-background text-white">
      <ServicePageViewTracker
        serviceId={service.id}
        slug={service.slug}
        title={service.title}
        professionalName={service.professionalName}
      />

      {/* Hero: 552px mobile, full viewport height on desktop */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[552px] overflow-hidden md:h-svh">
        <ServiceHeroBackground
          desktopUrl={service.imageUrl}
          mobileUrl={mobileHeroUrl}
        />
        <div
          className="absolute inset-0 md:hidden"
          style={HERO_BOTTOM_GRADIENT_MOBILE}
        />
        <div
          className="absolute inset-0 hidden md:block"
          style={HERO_BOTTOM_GRADIENT_DESKTOP}
        />
        <div
          className="absolute inset-0 hidden md:block"
          style={HERO_LEFT_SCRIM}
        />
      </div>

      {/* Back / share — mobile icon buttons */}
      <div
        className={cn(
          "absolute inset-x-0 top-0 z-20 flex items-center justify-between gap-3 pt-24 md:hidden",
          HOME_PAGE_GUTTER_CLASS,
        )}
      >
        <ServiceHeroMobileBackButton />
        <ServiceHeroMobileShareButton {...shareProps} />
      </div>

      {/* Back / share — desktop text controls */}
      <div
        className={cn(
          "absolute inset-x-0 top-0 z-20 hidden items-center justify-between gap-3 pt-36 md:flex",
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
        <ServiceShareButton {...shareProps} />
      </div>

      {/* Mobile hero info pinned to bottom of 552px hero */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[552px] md:hidden">
        <div
          className={cn(
            "pointer-events-auto absolute inset-x-0 bottom-0 pb-6",
            HOME_PAGE_GUTTER_CLASS,
          )}
        >
          <ServiceHeroInfo
            service={service}
            contactProps={contactProps}
            outboundBase={outboundBase}
          />
        </div>
      </div>

      <div className="relative z-10 pt-[552px] md:pt-0">
        <div className={HERO_INFO_TOP_SPACER} aria-hidden />

        <div className={HOME_PAGE_GUTTER_CLASS}>
          <div className="hidden md:block">
            <ServiceHeroInfo
              service={service}
              contactProps={contactProps}
              outboundBase={outboundBase}
            />
          </div>

          <div className="mt-0 space-y-12 pb-12 md:mt-[112px] md:space-y-16 md:pb-16">
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
                    <ServiceOutboundLink
                      href={service.instagramUrl}
                      option="instagram"
                      catalogueSurface="description"
                      className="inline-flex items-center gap-2 text-base font-medium text-white hover:text-white/80"
                      {...outboundBase}
                    >
                      <Instagram className="size-4" strokeWidth={2} aria-hidden />
                      {service.instagramHandle || "Instagram"}
                    </ServiceOutboundLink>
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
                      <div className="flex min-w-0 flex-1 flex-col gap-2 md:flex-row md:items-center md:gap-4">
                        <div className="min-w-0 flex-1 space-y-1">
                          <p className="font-medium">{review.authorName}</p>
                          <p className="text-sm leading-relaxed text-white/80">
                            {review.body}
                          </p>
                        </div>
                        <div className="flex shrink-0 flex-row items-center gap-2 md:flex-col md:items-center md:gap-1 md:self-center">
                          <span className="text-lg font-semibold leading-none">
                            {review.rating}
                          </span>
                          <Stars rating={review.rating} />
                        </div>
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
          <div
            className={cn(
              "catalog-h-scroll overflow-x-auto overscroll-x-contain",
              HOME_CATALOG_SCROLL_GUTTER_CLASS,
            )}
          >
            <ul className="flex w-max gap-4">
              {similares.map((item) => (
                <li
                  key={item.id}
                  className="h-[216px] w-[160px] shrink-0 md:h-[304px] md:w-[512px]"
                >
                  <ServiceCard
                    service={toServiceOffering(item)}
                    variant="tile"
                    catalogueSurface="similar"
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
