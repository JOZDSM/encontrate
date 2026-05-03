import { auth } from "@/auth";
import { MisFavoritosBody } from "@/components/pages/mis-favoritos-body";

export const metadata = {
  title: "Mis favoritos",
};

export default async function MisCosasFavoritosPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  return <MisFavoritosBody userId={session.user.id} />;
}
