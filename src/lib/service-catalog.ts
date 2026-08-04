import type { Service, ServiceReview } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import type {
  CuratedCollection,
  ServiceOffering,
} from "@/lib/mock-services-catalog";

export type ServiceDetail = Service & {
  reviews: ServiceReview[];
};

export function toServiceOffering(service: Service): ServiceOffering {
  return {
    id: service.id,
    slug: service.slug,
    title: service.title,
    professionalName: service.professionalName,
    category: service.category,
    neighborhood: service.neighborhood ?? undefined,
    priceNote: service.priceNote ?? undefined,
    imageUrl: service.imageUrl,
    featured: service.featured,
  };
}

export async function listPublishedServices(): Promise<Service[]> {
  return prisma.service.findMany({
    where: { published: true },
    orderBy: [{ featured: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
  });
}

export async function getPublishedServiceBySlug(
  slug: string,
): Promise<ServiceDetail | null> {
  return prisma.service.findFirst({
    where: { slug, published: true },
    include: {
      reviews: { orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] },
    },
  });
}

export async function getSimilarServices(
  service: Pick<Service, "id" | "category">,
  limit = 8,
): Promise<Service[]> {
  return prisma.service.findMany({
    where: {
      published: true,
      category: service.category,
      id: { not: service.id },
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    take: limit,
  });
}

export async function getCatalogRows(): Promise<{
  recent: ServiceOffering[];
  categories: CuratedCollection[];
}> {
  const services = await listPublishedServices();
  const offerings = services.map(toServiceOffering);
  const recent = offerings.filter((s) => s.featured).slice(0, 8);
  const recentFallback =
    recent.length > 0 ? recent : offerings.slice(0, 8);

  const byCategory = new Map<string, ServiceOffering[]>();
  for (const item of offerings) {
    const list = byCategory.get(item.category) ?? [];
    list.push(item);
    byCategory.set(item.category, list);
  }

  const categories: CuratedCollection[] = [...byCategory.entries()].map(
    ([category, items]) => ({
      id: category.toLowerCase().replace(/\s+/g, "-"),
      title: category,
      slug: category.toLowerCase().replace(/\s+/g, "-"),
      items: padCategoryItems(items),
    }),
  );

  return { recent: recentFallback, categories };
}

function padCategoryItems(
  items: ServiceOffering[],
  minCount = 6,
): ServiceOffering[] {
  if (items.length === 0) return items;
  const padded = [...items];
  let n = 0;
  while (padded.length < minCount) {
    const source = items[n % items.length]!;
    padded.push({
      ...source,
      id: `${source.id}-pad-${padded.length}`,
    });
    n += 1;
  }
  return padded;
}
