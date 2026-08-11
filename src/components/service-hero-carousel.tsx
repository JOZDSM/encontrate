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
        <PipolLogo className="max-w-[14rem] sm:max-w-56 md:max-w-64" />
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
      <p className="max-w-full text-3xl font-bold tracking-tight break-words text-white sm:text-5xl md:text-6xl">
        {service.brandName}
      </p>
    </HeroBrandWithBadge>
  );
}

function HeroSlideCopy({ service }: { service: FeaturedService }) {
  return (
    <div className="flex w-full min-w-0 max-w-lg flex-col gap-4 text-left md:max-w-none md:gap-5">
      <FeaturedBrandTitle service={service} />

      {service.hours.length > 0 || (!service.locationLabel && service.address) ? (
        <div className="max-w-md space-y-1 text-sm leading-5 text-white/80">
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
          className="absolute inset-0 size-full object-cover object-center"
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
}: {
  items: FeaturedService[];
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
      className="relative h-[80svh] min-h-[80svh] w-full overflow-hidden bg-background md:h-svh md:min-h-svh"
      aria-roledescription="carousel"
      aria-label="Servicios destacados"
    >
      {items.map((service, i) => (
        <HeroMedia
          key={service.id}
          service={service}
          active={i === index}
        />
      ))}

      {/* Bottom fade — stronger on mobile so the image edge blends into the catalog. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(to_bottom,transparent_55%,var(--background)_100%)] md:bg-[linear-gradient(to_bottom,transparent_85%,var(--background)_100%)]"
      />
      {/* Left scrim — desktop only; mobile copy sits on the bottom fade. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] hidden md:block"
        style={{
          background:
            "linear-gradient(to right, color-mix(in oklab, var(--background) 80%, transparent) 0%, color-mix(in oklab, var(--background) 40%, transparent) 30%, transparent 50%)",
        }}
      />

      <div
        className={cn(
          "absolute inset-x-0 z-10 flex flex-col",
          HOME_PAGE_GUTTER_CLASS,
          /* Mobile: pin content above first catalog row (gap-8). Desktop: center in overlap band. */
          "top-20 bottom-8 justify-end md:top-28 md:bottom-[184px] md:justify-center",
          "items-center md:items-stretch",
        )}
      >
        <div className="grid w-full min-w-0 max-w-lg md:max-w-none">
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
          <div className="mt-8 flex w-full max-w-lg items-center justify-center gap-2 md:max-w-none md:justify-start">
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
