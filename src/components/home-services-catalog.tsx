"use client";

import { useEffect, useMemo } from "react";
import { CatalogSearchBar } from "@/components/catalog-search-bar";
import { useCatalogSearch } from "@/components/catalog-search-provider";
import { ServiceHeroCarousel } from "@/components/service-hero-carousel";
import { ServiceScrollRow } from "@/components/service-scroll-row";
import { SiteFooter } from "@/components/site-footer";
import { flattenCatalogOfferings } from "@/lib/catalog-search";
import {
  MOCK_FEATURED_SERVICES,
  type CuratedCollection,
  type ServiceOffering,
} from "@/lib/mock-services-catalog";
import { HOME_PAGE_GUTTER_CLASS } from "@/lib/home-catalog-layout";
import { cn } from "@/lib/utils";

/**
 * How far Recientes pulls up over the hero on desktop.
 * Base 230px, shifted down by 20% of that on-load visible strip (~46px).
 * Mobile uses no pull-up so hero content can sit gap-8 above the first row.
 */
export const HOME_CATALOG_OVERLAP = "184px";

export function HomeServicesCatalog({
  recent,
  categories,
}: {
  recent: ServiceOffering[];
  categories: CuratedCollection[];
}) {
  const { setServices } = useCatalogSearch();

  const offerings = useMemo(
    () => flattenCatalogOfferings(recent, categories),
    [recent, categories],
  );

  useEffect(() => {
    setServices(offerings);
  }, [offerings, setServices]);

  return (
    <div className="relative w-full text-white">
      <ServiceHeroCarousel items={MOCK_FEATURED_SERVICES} />

      <section
        data-home-catalog
        className={cn(
          "relative z-20 mt-0",
          "md:-mt-[184px]",
        )}
      >
        <div data-home-catalog-over-hero>
          <ServiceScrollRow
            title="Recomendados por Encontrate"
            items={recent}
            catalogueSurface="recommended"
          />
        </div>

        <div className="bg-background">
          <div className={cn(HOME_PAGE_GUTTER_CLASS, "pt-12 pb-5 md:pt-14 md:pb-6")}>
            <CatalogSearchBar
              id="catalog-main-search"
              variant="prominent"
              inputClassName="border-white/30 bg-background"
            />
          </div>

          <div className="space-y-8 pb-8 md:space-y-10 md:pb-10">
            {categories.map((collection) => (
              <ServiceScrollRow
                key={collection.id}
                title={collection.title}
                items={collection.items}
                catalogueSurface={collection.slug}
              />
            ))}
          </div>

          <SiteFooter />
        </div>
      </section>
    </div>
  );
}
