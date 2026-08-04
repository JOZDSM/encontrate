import { ServiceCard } from "@/components/service-card";
import type { CuratedCollection } from "@/lib/mock-services-catalog";

export function CuratedCollectionRow({
  collection,
}: {
  collection: CuratedCollection;
}) {
  return (
    <section
      data-collection-slug={collection.slug}
      className="space-y-4"
      aria-labelledby={`collection-${collection.id}`}
    >
      <div className="space-y-1">
        <h2
          id={`collection-${collection.id}`}
          className="text-xl font-semibold tracking-tight text-foreground"
        >
          {collection.title}
        </h2>
        {collection.description ? (
          <p className="text-sm text-muted-foreground">{collection.description}</p>
        ) : null}
      </div>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {collection.items.map((item) => (
          <li key={item.id}>
            <ServiceCard service={item} />
          </li>
        ))}
      </ul>
    </section>
  );
}
