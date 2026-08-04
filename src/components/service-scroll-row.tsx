import { ServiceCard } from "@/components/service-card";
import type { ServiceOffering } from "@/lib/mock-services-catalog";
import { HOME_PAGE_GUTTER_CLASS } from "@/lib/home-catalog-layout";
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
      {/* Left gutter only — cards continue past the right edge of the viewport. */}
      <div className="catalog-h-scroll overflow-x-auto overscroll-x-contain pl-8">
        <ul className="flex w-max gap-4 pr-8">
          {items.map((item) => (
            <li key={item.id} className="h-[304px] w-[512px] shrink-0">
              <ServiceCard service={item} variant="tile" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
