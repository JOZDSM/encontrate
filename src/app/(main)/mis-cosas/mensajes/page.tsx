import { auth } from "@/auth";
import { MensajesBody } from "@/components/pages/mensajes-body";

export const metadata = {
  title: "Mensajes",
};

export default async function MisCosasMensajesPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  return <MensajesBody userId={session.user.id} />;
}
