import { redirect } from "next/navigation";
import { AdminServiceForm } from "@/components/admin-service-form";
import { auth } from "@/auth";
import { isPlatformAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";

export default async function AdminNewServicePage() {
  const session = await auth();
  if (!isPlatformAdmin(session)) redirect("/");

  const categories = await prisma.serviceCategory.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, name: true },
  });

  return <AdminServiceForm categories={categories} />;
}
