import type {
  Service,
  ServiceCategory,
  ServiceReview,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import type {
  CuratedCollection,
  ServiceOffering,
} from "@/lib/mock-services-catalog";

export type ServiceWithCategory = Service & {
  category: Pick<ServiceCategory, "id" | "name" | "slug" | "synonyms" | "sortOrder">;
};

export type ServiceDetail = ServiceWithCategory & {
  reviews: ServiceReview[];
};

export function toServiceOffering(service: ServiceWithCategory): ServiceOffering {
  return {
    id: service.id,
    slug: service.slug,
    title: service.title,
    professionalName: service.professionalName,
    category: service.category.name,
    categorySynonyms: service.category.synonyms,
    neighborhood: service.neighborhood ?? undefined,
    priceNote: service.priceNote ?? undefined,
    imageUrl: service.imageUrl,
    featured: service.featured,
  };
}

const categoryInclude = {
  category: {
    select: {
      id: true,
      name: true,
      slug: true,
      synonyms: true,
      sortOrder: true,
    },
  },
} as const;

export async function listPublishedServices(): Promise<ServiceWithCategory[]> {
  return prisma.service.findMany({
    where: { published: true },
    include: categoryInclude,
    orderBy: [{ featured: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
  });
}

export async function getPublishedServiceBySlug(
  slug: string,
): Promise<ServiceDetail | null> {
  return prisma.service.findFirst({
    where: { slug, published: true },
    include: {
      ...categoryInclude,
      reviews: { orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] },
    },
  });
}

export async function getSimilarServices(
  service: Pick<Service, "id" | "categoryId">,
  limit = 8,
): Promise<ServiceWithCategory[]> {
  return prisma.service.findMany({
    where: {
      published: true,
      categoryId: service.categoryId,
      id: { not: service.id },
    },
    include: categoryInclude,
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    take: limit,
  });
}

export async function getCatalogRows(): Promise<{
  recent: ServiceOffering[];
  categories: CuratedCollection[];
}> {
  const [services, categoryRows] = await Promise.all([
    listPublishedServices(),
    prisma.serviceCategory.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true, slug: true },
    }),
  ]);

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

  const categories: CuratedCollection[] = categoryRows
    .map((row) => {
      const items = byCategory.get(row.name) ?? [];
      if (items.length === 0) return null;
      return {
        id: row.id,
        title: row.name,
        slug: row.slug,
        items: padCategoryItems(items),
      };
    })
    .filter((row): row is CuratedCollection => row !== null);

  // Include any leftover category names not in ServiceCategory (shouldn't happen)
  for (const [name, items] of byCategory) {
    if (categories.some((c) => c.title === name)) continue;
    categories.push({
      id: name.toLowerCase().replace(/\s+/g, "-"),
      title: name,
      slug: name.toLowerCase().replace(/\s+/g, "-"),
      items: padCategoryItems(items),
    });
  }

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
