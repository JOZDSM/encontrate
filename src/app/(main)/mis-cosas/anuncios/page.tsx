import { auth } from "@/auth";
import { HostListingsBody } from "@/components/pages/host-listings-body";

export const metadata = {
  title: "Mis anuncios",
};

export default async function MisCosasAnunciosPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  return <HostListingsBody hostId={session.user.id} />;
}
