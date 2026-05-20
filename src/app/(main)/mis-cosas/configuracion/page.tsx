import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AccountSettingsPanel } from "@/components/account-settings-panel";
import { prisma } from "@/lib/db";

export const metadata = {
  title: "Mi cuenta",
};

export default async function MisCosasConfiguracionPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      whatsappNumber: true,
      accounts: { select: { provider: true } },
      emailChangeRequests: {
        take: 1,
        orderBy: { createdAt: "desc" },
        select: { newEmail: true, expiresAt: true },
      },
    },
  });

  if (!user) redirect("/login");

  const providers = user.accounts.map((a) => a.provider);
  const hasGoogleAccount = providers.includes("google");
  const hasPasswordLogin = providers.includes("credentials");

  const pending = user.emailChangeRequests[0] ?? null;
  const pendingEmailChange = pending
    ? { newEmail: pending.newEmail, expiresAt: pending.expiresAt.toISOString() }
    : null;

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-card-foreground">
        <h1 className="text-2xl font-semibold">Mi cuenta</h1>
        <p className="text-sm text-muted-foreground">
          Gestioná tus datos personales, seguridad y preferencias.
        </p>
      </div>

      <AccountSettingsPanel
        name={user.name}
        email={user.email}
        whatsappNumber={user.whatsappNumber}
        hasGoogleAccount={hasGoogleAccount}
        hasPasswordLogin={hasPasswordLogin}
        pendingEmailChange={pendingEmailChange}
      />
    </div>
  );
}
