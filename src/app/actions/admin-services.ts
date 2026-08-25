"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { isPlatformAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
import {
  isReservedServiceSlug,
  isValidServiceSlug,
  slugifyProfessionalName,
} from "@/lib/service-slug";

const reviewSchema = z.object({
  id: z.string().optional(),
  authorName: z.string().trim().min(1).max(120),
  body: z.string().trim().min(1).max(2000),
  rating: z.coerce.number().int().min(1).max(5),
  avatarUrl: z.string().trim().max(500).optional().or(z.literal("")),
  sortOrder: z.coerce.number().int().optional(),
});

const serviceInputSchema = z.object({
  professionalName: z.string().trim().min(2).max(120),
  slug: z.string().trim().min(2).max(80).optional().or(z.literal("")),
  title: z.string().trim().min(2).max(160),
  categoryId: z.string().trim().min(1),
  description: z.string().trim().min(10).max(8000),
  imageUrl: z.string().trim().min(1).max(500),
  imageMobileUrl: z.string().trim().max(500).optional().or(z.literal("")),
  websiteUrl: z.string().trim().max(500).optional().or(z.literal("")),
  instagramUrl: z.string().trim().max(500).optional().or(z.literal("")),
  instagramHandle: z.string().trim().max(80).optional().or(z.literal("")),
  whatsapp: z.string().trim().max(40).optional().or(z.literal("")),
  email: z.string().trim().max(160).optional().or(z.literal("")),
  showWhatsapp: z.boolean().optional(),
  showEmail: z.boolean().optional(),
  offeringItemsText: z.string().optional(),
  neighborhood: z.string().trim().max(120).optional().or(z.literal("")),
  priceNote: z.string().trim().max(120).optional().or(z.literal("")),
  published: z.boolean().optional(),
  featured: z.boolean().optional(),
  sortOrder: z.coerce.number().int().optional(),
  reviews: z.array(reviewSchema).optional(),
});

export type ServiceFormInput = z.infer<typeof serviceInputSchema>;

function emptyToNull(value: string | undefined): string | null {
  const v = value?.trim();
  return v ? v : null;
}

function parseOfferingItems(text: string | undefined): string[] {
  if (!text?.trim()) return [];
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

async function resolveUniqueSlug(
  desired: string,
  excludeId?: string,
): Promise<string | { error: string }> {
  if (!isValidServiceSlug(desired)) {
    return {
      error: isReservedServiceSlug(desired)
        ? "Ese slug está reservado por una ruta del sitio."
        : "Slug inválido. Usá solo minúsculas, números y guiones.",
    };
  }

  const existing = await prisma.service.findUnique({
    where: { slug: desired },
    select: { id: true },
  });
  if (existing && existing.id !== excludeId) {
    return { error: "Ya existe un servicio con ese slug." };
  }
  return desired;
}

export async function createServiceAction(
  raw: ServiceFormInput,
): Promise<{ ok: true; id: string; slug: string } | { ok: false; error: string }> {
  const session = await auth();
  if (!isPlatformAdmin(session)) return { ok: false, error: "No autorizado." };

  const parsed = serviceInputSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: "Revisá los campos del formulario." };
  }

  const data = parsed.data;
  const category = await prisma.serviceCategory.findUnique({
    where: { id: data.categoryId },
    select: { id: true },
  });
  if (!category) return { ok: false, error: "Categoría no encontrada." };

  const baseSlug =
    data.slug?.trim() || slugifyProfessionalName(data.professionalName);
  const slugResult = await resolveUniqueSlug(baseSlug);
  if (typeof slugResult === "object") return { ok: false, error: slugResult.error };

  const service = await prisma.service.create({
    data: {
      slug: slugResult,
      professionalName: data.professionalName,
      title: data.title,
      categoryId: data.categoryId,
      description: data.description,
      imageUrl: data.imageUrl,
      imageMobileUrl: emptyToNull(data.imageMobileUrl),
      websiteUrl: emptyToNull(data.websiteUrl),
      instagramUrl: emptyToNull(data.instagramUrl),
      instagramHandle: emptyToNull(data.instagramHandle),
      whatsapp: emptyToNull(data.whatsapp),
      email: emptyToNull(data.email),
      showWhatsapp: data.showWhatsapp ?? true,
      showEmail: data.showEmail ?? true,
      offeringItems: parseOfferingItems(data.offeringItemsText),
      neighborhood: emptyToNull(data.neighborhood),
      priceNote: emptyToNull(data.priceNote),
      published: data.published ?? false,
      featured: data.featured ?? false,
      sortOrder: data.sortOrder ?? 0,
      reviews: data.reviews?.length
        ? {
            create: data.reviews.map((r, i) => ({
              authorName: r.authorName,
              body: r.body,
              rating: r.rating,
              avatarUrl: emptyToNull(r.avatarUrl),
              sortOrder: r.sortOrder ?? i,
            })),
          }
        : undefined,
    },
    select: { id: true, slug: true },
  });

  revalidatePath("/admin/services");
  revalidatePath("/");
  revalidatePath(`/${service.slug}`);
  return { ok: true, id: service.id, slug: service.slug };
}

export async function updateServiceAction(
  id: string,
  raw: ServiceFormInput,
): Promise<{ ok: true; slug: string } | { ok: false; error: string }> {
  const session = await auth();
  if (!isPlatformAdmin(session)) return { ok: false, error: "No autorizado." };

  const parsed = serviceInputSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: "Revisá los campos del formulario." };
  }

  const existing = await prisma.service.findUnique({
    where: { id },
    select: { id: true, slug: true },
  });
  if (!existing) return { ok: false, error: "Servicio no encontrado." };

  const data = parsed.data;
  const category = await prisma.serviceCategory.findUnique({
    where: { id: data.categoryId },
    select: { id: true },
  });
  if (!category) return { ok: false, error: "Categoría no encontrada." };

  const baseSlug =
    data.slug?.trim() || slugifyProfessionalName(data.professionalName);
  const slugResult = await resolveUniqueSlug(baseSlug, id);
  if (typeof slugResult === "object") return { ok: false, error: slugResult.error };

  await prisma.$transaction(async (tx) => {
    await tx.serviceReview.deleteMany({ where: { serviceId: id } });
    await tx.service.update({
      where: { id },
      data: {
        slug: slugResult,
        professionalName: data.professionalName,
        title: data.title,
        categoryId: data.categoryId,
        description: data.description,
        imageUrl: data.imageUrl,
        imageMobileUrl: emptyToNull(data.imageMobileUrl),
        websiteUrl: emptyToNull(data.websiteUrl),
        instagramUrl: emptyToNull(data.instagramUrl),
        instagramHandle: emptyToNull(data.instagramHandle),
        whatsapp: emptyToNull(data.whatsapp),
        email: emptyToNull(data.email),
        showWhatsapp: data.showWhatsapp ?? true,
        showEmail: data.showEmail ?? true,
        offeringItems: parseOfferingItems(data.offeringItemsText),
        neighborhood: emptyToNull(data.neighborhood),
        priceNote: emptyToNull(data.priceNote),
        published: data.published ?? false,
        featured: data.featured ?? false,
        sortOrder: data.sortOrder ?? 0,
        reviews: data.reviews?.length
          ? {
              create: data.reviews.map((r, i) => ({
                authorName: r.authorName,
                body: r.body,
                rating: r.rating,
                avatarUrl: emptyToNull(r.avatarUrl),
                sortOrder: r.sortOrder ?? i,
              })),
            }
          : undefined,
      },
    });
  });

  revalidatePath("/admin/services");
  revalidatePath("/");
  revalidatePath(`/${existing.slug}`);
  revalidatePath(`/${slugResult}`);
  return { ok: true, slug: slugResult };
}

export async function deleteServiceAction(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!isPlatformAdmin(session)) return { ok: false, error: "No autorizado." };

  const existing = await prisma.service.findUnique({
    where: { id },
    select: { slug: true },
  });
  if (!existing) return { ok: false, error: "Servicio no encontrado." };

  await prisma.service.delete({ where: { id } });
  revalidatePath("/admin/services");
  revalidatePath("/");
  revalidatePath(`/${existing.slug}`);
  return { ok: true };
}
