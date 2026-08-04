import { redirect } from "next/navigation";
import { AdminServiceForm } from "@/components/admin-service-form";
import { auth } from "@/auth";
import { isPlatformAdmin } from "@/lib/admin";

export default async function AdminNewServicePage() {
  const session = await auth();
  if (!isPlatformAdmin(session)) redirect("/");

  return <AdminServiceForm />;
}
