import { notFound, redirect } from "next/navigation";
import { AdminCategoryForm } from "@/components/admin-category-form";
import { auth } from "@/auth";
import { isPlatformAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";

export default async function AdminEditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!isPlatformAdmin(session)) redirect("/");

  const { id } = await params;
  const category = await prisma.serviceCategory.findUnique({
    where: { id },
  });
  if (!category) notFound();

  return (
    <AdminCategoryForm
      categoryId={category.id}
      initial={{
        name: category.name,
        slug: category.slug,
        synonymsText: category.synonyms.join(", "),
        sortOrder: category.sortOrder,
      }}
    />
  );
}
