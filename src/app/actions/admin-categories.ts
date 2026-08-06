"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { isPlatformAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { slugifyProfessionalName } from "@/lib/service-slug";

const categoryInputSchema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: z.string().trim().min(2).max(80).optional().or(z.literal("")),
  synonymsText: z.string().optional(),
  sortOrder: z.coerce.number().int().optional(),
});

export type CategoryFormInput = z.infer<typeof categoryInputSchema>;

function parseSynonyms(text: string | undefined): string[] {
  if (!text?.trim()) return [];
  return [
    ...new Set(
      text
        .split(/[,;\n]+/)
        .map((s) => s.trim())
        .filter(Boolean),
    ),
  ];
}

async function resolveUniqueCategorySlug(
  desired: string,
  excludeId?: string,
): Promise<string | { error: string }> {
  const slug = slugifyProfessionalName(desired);
  if (!slug) {
    return { error: "Slug inválido." };
  }

  const existing = await prisma.serviceCategory.findUnique({
    where: { slug },
    select: { id: true },
  });
  if (existing && existing.id !== excludeId) {
    return { error: "Ya existe una categoría con ese slug." };
  }
  return slug;
}

export async function createCategoryAction(
  raw: CategoryFormInput,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const session = await auth();
  if (!isPlatformAdmin(session)) return { ok: false, error: "No autorizado." };

  const parsed = categoryInputSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: "Revisá los campos del formulario." };
  }

  const data = parsed.data;
  const nameTaken = await prisma.serviceCategory.findUnique({
    where: { name: data.name },
    select: { id: true },
  });
  if (nameTaken) {
    return { ok: false, error: "Ya existe una categoría con ese nombre." };
  }

  const slugResult = await resolveUniqueCategorySlug(
    data.slug?.trim() || data.name,
  );
  if (typeof slugResult === "object") return { ok: false, error: slugResult.error };

  const category = await prisma.serviceCategory.create({
    data: {
      name: data.name,
      slug: slugResult,
      synonyms: parseSynonyms(data.synonymsText),
      sortOrder: data.sortOrder ?? 0,
    },
    select: { id: true },
  });

  revalidatePath("/admin/categories");
  revalidatePath("/admin/services");
  revalidatePath("/");
  return { ok: true, id: category.id };
}

export async function updateCategoryAction(
  id: string,
  raw: CategoryFormInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!isPlatformAdmin(session)) return { ok: false, error: "No autorizado." };

  const parsed = categoryInputSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: "Revisá los campos del formulario." };
  }

  const existing = await prisma.serviceCategory.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!existing) return { ok: false, error: "Categoría no encontrada." };

  const data = parsed.data;
  const nameTaken = await prisma.serviceCategory.findFirst({
    where: { name: data.name, NOT: { id } },
    select: { id: true },
  });
  if (nameTaken) {
    return { ok: false, error: "Ya existe una categoría con ese nombre." };
  }

  const slugResult = await resolveUniqueCategorySlug(
    data.slug?.trim() || data.name,
    id,
  );
  if (typeof slugResult === "object") return { ok: false, error: slugResult.error };

  await prisma.serviceCategory.update({
    where: { id },
    data: {
      name: data.name,
      slug: slugResult,
      synonyms: parseSynonyms(data.synonymsText),
      sortOrder: data.sortOrder ?? 0,
    },
  });

  revalidatePath("/admin/categories");
  revalidatePath("/admin/services");
  revalidatePath("/");
  return { ok: true };
}

export async function deleteCategoryAction(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!isPlatformAdmin(session)) return { ok: false, error: "No autorizado." };

  const existing = await prisma.serviceCategory.findUnique({
    where: { id },
    select: {
      id: true,
      _count: { select: { services: true } },
    },
  });
  if (!existing) return { ok: false, error: "Categoría no encontrada." };

  if (existing._count.services > 0) {
    return {
      ok: false,
      error: `No se puede borrar: hay ${existing._count.services} servicio(s) en esta categoría. Reasignalos primero.`,
    };
  }

  await prisma.serviceCategory.delete({ where: { id } });
  revalidatePath("/admin/categories");
  revalidatePath("/admin/services");
  revalidatePath("/");
  return { ok: true };
}
