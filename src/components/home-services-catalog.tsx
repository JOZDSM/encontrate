"use client";

import { useEffect } from "react";
import { CatalogSearchBar } from "@/components/catalog-search-bar";
import { ServiceHeroCarousel } from "@/components/service-hero-carousel";
import { ServiceScrollRow } from "@/components/service-scroll-row";
import { SiteFooter } from "@/components/site-footer";
import {
  MOCK_FEATURED_SERVICES,
  type CuratedCollection,
  type ServiceOffering,
} from "@/lib/mock-services-catalog";
import { HOME_PAGE_GUTTER_CLASS } from "@/lib/home-catalog-layout";
import { cn } from "@/lib/utils";

/**
 * How far Recientes pulls up over the hero.
 * Base 230px, shifted down by 20% of that on-load visible strip (~46px).
 */
export const HOME_CATALOG_OVERLAP = "184px";

export function HomeServicesCatalog({
  recent,
  categories,
}: {
  recent: ServiceOffering[];
  categories: CuratedCollection[];
}) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "e" && event.key !== "E") return;
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT")
      ) {
        return;
      }
      event.preventDefault();
      const el = document.getElementById("catalog-main-search");
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      window.setTimeout(() => el?.focus(), 350);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="relative w-full text-white">
      <ServiceHeroCarousel
        items={MOCK_FEATURED_SERVICES}
        catalogOverlap={HOME_CATALOG_OVERLAP}
      />

      <section
        data-home-catalog
        className="relative z-20"
        style={{ marginTop: `calc(-1 * ${HOME_CATALOG_OVERLAP})` }}
      >
        <div data-home-catalog-over-hero>
          <ServiceScrollRow
            title="Recomendados por Encontrate"
            items={recent}
          />
        </div>

        <div className="bg-black">
          <div className={cn(HOME_PAGE_GUTTER_CLASS, "my-8 md:my-10")}>
            <CatalogSearchBar
              id="catalog-main-search"
              variant="prominent"
              inputClassName="border-white/30 bg-black"
            />
          </div>

          <div className="space-y-8 pb-8 md:space-y-10 md:pb-10">
            {categories.map((collection) => (
              <ServiceScrollRow
                key={collection.id}
                title={collection.title}
                items={collection.items}
              />
            ))}
          </div>

          <SiteFooter />
        </div>
      </section>
    </div>
  );
}
