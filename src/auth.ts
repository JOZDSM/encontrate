import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { Session } from "next-auth";
import authConfig from "@/auth.config";
import { getDesignPreviewSession, isDesignPreviewActive } from "@/lib/design-preview";
import { notifyAdminsPendingUser } from "@/lib/admin-pending-user-email";
import { prisma } from "@/lib/db";

async function findSignupProfileByEmail(email: string) {
  const normalized = email.trim().toLowerCase();
  return prisma.signupProfile.findFirst({
    where: { email: { equals: normalized, mode: "insensitive" } },
  });
}

const nextAuth = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  events: {
    async signIn({ user, account, isNewUser }) {
      const email = user.email?.trim();
      if (!email) return;

      let signupWhatsappForEmail: string | null = null;
      const pending = await findSignupProfileByEmail(email);
      if (pending) {
        if (pending.expiresAt.getTime() < Date.now()) {
          await prisma.signupProfile
            .delete({ where: { email: pending.email } })
            .catch(() => {});
        } else {
          signupWhatsappForEmail = pending.whatsappNumber?.trim() || null;
          const nextName = pending.name?.trim() ? pending.name.trim() : undefined;
          const nextWhatsapp = signupWhatsappForEmail ?? undefined;

          await prisma.user.update({
            where: { id: user.id },
            data: {
              ...(nextName ? { name: nextName } : {}),
              ...(nextWhatsapp ? { whatsappNumber: nextWhatsapp } : {}),
            },
          });

          await prisma.signupProfile
            .delete({ where: { email: pending.email } })
            .catch(() => {});
        }
      }

      if (!isNewUser) return;

      const fresh = await prisma.user.findUnique({
        where: { id: user.id },
        select: { name: true, whatsappNumber: true, isApproved: true },
      });

      const displayName = fresh?.name?.trim() || user.name?.trim() || "—";
      const displayWhatsapp =
        fresh?.whatsappNumber?.trim() || signupWhatsappForEmail || "—";
      const provider = account?.provider ?? "unknown";
      const providerAccountId = account?.providerAccountId ?? "—";

      await notifyAdminsPendingUser({
        displayName,
        email,
        displayWhatsapp,
        provider,
        providerAccountId,
        isApproved: Boolean(fresh?.isApproved),
        variant: "initial",
      });
    },
  },
});

export const { handlers, signIn, signOut } = nextAuth;

/** Use in Server Components, actions, etc. Middleware uses `NextAuth(authConfig)` in `middleware.ts`. */
export async function auth(): Promise<Session | null> {
  if (isDesignPreviewActive()) {
    return getDesignPreviewSession();
  }
  const session = await nextAuth.auth();
  if (!session?.user?.id) return session;

  try {
    const fresh = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isAdmin: true, isApproved: true, whatsappNumber: true },
    });
    if (!fresh) {
      return null;
    }
    session.user.isAdmin = session.user.isAdmin || fresh.isAdmin;
    session.user.isApproved = fresh.isApproved;
    session.user.whatsappNumber = fresh.whatsappNumber;
  } catch {
    // If the DB is temporarily unavailable/misconfigured, don't crash every page render.
    // Pages/actions that truly require DB access will fail in a more specific place.
  }
  return session;
}
