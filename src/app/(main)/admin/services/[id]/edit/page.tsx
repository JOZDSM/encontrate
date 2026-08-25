import { notFound, redirect } from "next/navigation";
import { AdminServiceForm } from "@/components/admin-service-form";
import { auth } from "@/auth";
import { isPlatformAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";

export default async function AdminEditServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!isPlatformAdmin(session)) redirect("/");

  const { id } = await params;
  const [service, categories] = await Promise.all([
    prisma.service.findUnique({
      where: { id },
      include: {
        reviews: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] },
      },
    }),
    prisma.serviceCategory.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true },
    }),
  ]);
  if (!service) notFound();

  return (
    <AdminServiceForm
      serviceId={service.id}
      categories={categories}
      initial={{
        professionalName: service.professionalName,
        slug: service.slug,
        title: service.title,
        categoryId: service.categoryId,
        description: service.description,
        imageUrl: service.imageUrl,
        imageMobileUrl: service.imageMobileUrl ?? "",
        websiteUrl: service.websiteUrl ?? "",
        instagramUrl: service.instagramUrl ?? "",
        instagramHandle: service.instagramHandle ?? "",
        whatsapp: service.whatsapp ?? "",
        email: service.email ?? "",
        showWhatsapp: service.showWhatsapp,
        showEmail: service.showEmail,
        offeringItemsText: service.offeringItems.join("\n"),
        neighborhood: service.neighborhood ?? "",
        priceNote: service.priceNote ?? "",
        published: service.published,
        featured: service.featured,
        sortOrder: service.sortOrder,
        reviews: service.reviews.map((r) => ({
          id: r.id,
          authorName: r.authorName,
          body: r.body,
          rating: r.rating,
          avatarUrl: r.avatarUrl ?? "",
          sortOrder: r.sortOrder,
        })),
      }}
    />
  );
}
