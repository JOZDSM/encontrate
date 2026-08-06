import { redirect } from "next/navigation";
import { AdminCategoryForm } from "@/components/admin-category-form";
import { auth } from "@/auth";
import { isPlatformAdmin } from "@/lib/admin";

export default async function AdminNewCategoryPage() {
  const session = await auth();
  if (!isPlatformAdmin(session)) redirect("/");

  return <AdminCategoryForm />;
}
