"use client";

import { useEffect, useState } from "react";
import { DulceMariaLogo } from "@/components/dulce-maria-logo";
import { HeroBrandWithBadge } from "@/components/encontrate-hero-badge";
import {
  HeroInstagramCta,
  HeroLocationCta,
  HeroWebsiteCta,
} from "@/components/hero-location-cta";
import { PipolLogo } from "@/components/pipol-logo";
import type { FeaturedService } from "@/lib/mock-services-catalog";
import { HOME_PAGE_GUTTER_CLASS } from "@/lib/home-catalog-layout";
import { cn } from "@/lib/utils";

const ROTATE_MS = 9000;
const CROSSFADE_MS = 1200;

function FeaturedBrandTitle({ service }: { service: FeaturedService }) {
  if (service.brandLogo === "pipol") {
    return (
      <HeroBrandWithBadge>
        <PipolLogo className="w-[min(100%,14rem)] sm:w-56 md:w-64" />
      </HeroBrandWithBadge>
    );
  }
  if (service.brandLogo === "dulce-maria") {
    return (
      <HeroBrandWithBadge>
        <DulceMariaLogo />
      </HeroBrandWithBadge>
    );
  }

  return (
    <HeroBrandWithBadge>
      <p className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
        {service.brandName}
      </p>
    </HeroBrandWithBadge>
  );
}

function HeroSlideCopy({ service }: { service: FeaturedService }) {
  return (
    <div className="flex w-full flex-col gap-4 md:gap-5">
      <FeaturedBrandTitle service={service} />

      {service.hours.length > 0 || (!service.locationLabel && service.address) ? (
        <div className="max-w-md space-y-1 text-xs leading-relaxed text-white/80 sm:text-sm">
          {service.hours.map((line) => (
            <p key={line}>{line}</p>
          ))}
          {!service.locationLabel && service.address ? (
            <p>{service.address}</p>
          ) : null}
        </div>
      ) : null}

      <p className="max-w-lg text-base text-white/90 sm:text-lg">
        {service.tagline}
      </p>

      <div className="flex flex-wrap items-center gap-2 pt-1">
        {service.locationLabel && service.mapsUrl ? (
          <HeroLocationCta
            label={service.locationLabel}
            href={service.mapsUrl}
          />
        ) : null}
        {service.websiteUrl ? (
          <HeroWebsiteCta href={service.websiteUrl} />
        ) : null}
        {service.instagramUrl ? (
          <HeroInstagramCta
            href={service.instagramUrl}
            brandName={service.brandName}
          />
        ) : null}
      </div>
    </div>
  );
}

function HeroMedia({
  service,
  active,
}: {
  service: FeaturedService;
  active: boolean;
}) {
  const [videoFailed, setVideoFailed] = useState(false);
  const [panKey, setPanKey] = useState(0);
  const showVideo = Boolean(service.videoUrl) && !videoFailed;

  useEffect(() => {
    if (active && !showVideo) {
      setPanKey((key) => key + 1);
    }
  }, [active, showVideo]);

  return (
    <div
      className={cn(
        "absolute inset-0 overflow-hidden transition-opacity ease-in-out",
        active ? "opacity-100" : "pointer-events-none opacity-0",
      )}
      style={{ transitionDuration: `${CROSSFADE_MS}ms` }}
      aria-hidden={!active}
    >
      {showVideo ? (
        <video
          key={service.id}
          className="absolute inset-0 size-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          poster={service.posterUrl}
          onError={() => setVideoFailed(true)}
        >
          <source src={service.videoUrl} type="video/mp4" />
        </video>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={panKey}
          src={service.posterUrl}
          alt=""
          decoding="async"
          fetchPriority={active ? "high" : "low"}
          className={cn(
            "absolute inset-0 size-full origin-center scale-[1.1] object-cover object-center will-change-transform",
            panKey > 0 && "animate-hero-image-pan",
          )}
          style={
            panKey > 0
              ? { animationDuration: `${ROTATE_MS}ms` }
              : undefined
          }
        />
      )}
    </div>
  );
}

export function ServiceHeroCarousel({
  items,
  catalogOverlap = "230px",
}: {
  items: FeaturedService[];
  /** CSS length for space reserved above Recientes (matches catalog negative margin). */
  catalogOverlap?: string;
}) {
  const [index, setIndex] = useState(0);
  const active = items[index];

  useEffect(() => {
    if (items.length <= 1) return;
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % items.length);
    }, ROTATE_MS);
    return () => window.clearInterval(id);
    // Re-run when `index` changes so a manual dot click restarts the full timer.
  }, [index, items.length]);

  if (!active) return null;

  return (
    <section
      data-hero-carousel
      className="relative h-svh min-h-svh w-full overflow-hidden bg-background"
      aria-roledescription="carousel"
      aria-label="Servicios destacados"
    >
      {items.map((service, i) => (
        <HeroMedia key={service.id} service={service} active={i === index} />
      ))}

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            "linear-gradient(to bottom, transparent 85%, var(--background) 100%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            "linear-gradient(to right, color-mix(in oklab, var(--background) 80%, transparent) 0%, color-mix(in oklab, var(--background) 40%, transparent) 30%, transparent 50%)",
        }}
      />

      <div
        className={cn(
          "absolute inset-x-0 z-10 flex flex-col justify-center",
          HOME_PAGE_GUTTER_CLASS,
          /* Vertically center between navbar (on load) and Recientes overlap. */
          "top-20 md:top-28",
        )}
        style={{ bottom: catalogOverlap }}
      >
        <div className="grid w-full">
          {items.map((service, i) => {
            const isActive = i === index;
            return (
              <div
                key={service.id}
                className={cn(
                  "col-start-1 row-start-1 transition-opacity ease-in-out",
                  isActive
                    ? "relative z-10 opacity-100"
                    : "pointer-events-none z-0 opacity-0",
                )}
                style={{ transitionDuration: `${CROSSFADE_MS}ms` }}
                aria-hidden={!isActive}
              >
                <HeroSlideCopy service={service} />
              </div>
            );
          })}
        </div>

        {items.length > 1 ? (
          <div className="mt-8 flex w-full items-center gap-2">
            {items.map((service, i) => (
              <button
                key={service.id}
                type="button"
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === index
                    ? "w-8 bg-white"
                    : "w-3 bg-white/35 hover:bg-white/55",
                )}
                style={{ transitionDuration: `${CROSSFADE_MS}ms` }}
                aria-label={`Ver ${service.brandName}`}
                aria-current={i === index ? "true" : undefined}
                onClick={() => setIndex(i)}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
