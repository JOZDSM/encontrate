import { ServiceCard } from "@/components/service-card";
import type { ServiceOffering } from "@/lib/mock-services-catalog";
import {
  HOME_CATALOG_SCROLL_GUTTER_CLASS,
  HOME_PAGE_GUTTER_CLASS,
} from "@/lib/home-catalog-layout";
import { cn } from "@/lib/utils";

export function ServiceScrollRow({
  title,
  items,
}: {
  title: string;
  items: ServiceOffering[];
}) {
  return (
    <section className="space-y-3" aria-label={title}>
      <h2 className={cn("text-sm font-medium text-white/90", HOME_PAGE_GUTTER_CLASS)}>
        {title}
      </h2>
      {/* Left gutter aligns with page inset — cards continue past the right edge. */}
      <div
        className={cn(
          "catalog-h-scroll overflow-x-auto overscroll-x-contain",
          HOME_CATALOG_SCROLL_GUTTER_CLASS,
        )}
      >
        <ul className="flex w-max gap-4">
          {items.map((item) => (
            <li
              key={item.id}
              className="h-[216px] w-[160px] shrink-0 md:h-[304px] md:w-[512px]"
            >
              <ServiceCard service={item} variant="tile" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
