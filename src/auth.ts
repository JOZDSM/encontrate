import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { Session } from "next-auth";
import authConfig from "@/auth.config";
import { getDesignPreviewSession, isDesignPreviewActive } from "@/lib/design-preview";
import { prisma } from "@/lib/db";

const nextAuth = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  events: {
    async signIn({ user }) {
      const email = user.email ?? undefined;
      if (!email) return;

      const pending = await prisma.signupProfile.findUnique({
        where: { email },
      });
      if (!pending) return;
      if (pending.expiresAt.getTime() < Date.now()) {
        await prisma.signupProfile.delete({ where: { email } }).catch(() => {});
        return;
      }

      const nextName = pending.name?.trim() ? pending.name.trim() : undefined;
      const nextWhatsapp = pending.whatsappNumber?.trim()
        ? pending.whatsappNumber.trim()
        : undefined;

      await prisma.user.update({
        where: { id: user.id },
        data: {
          ...(nextName ? { name: nextName } : {}),
          ...(nextWhatsapp ? { whatsappNumber: nextWhatsapp } : {}),
        },
      });

      await prisma.signupProfile.delete({ where: { email } }).catch(() => {});
    },
  },
});

export const { handlers, signIn, signOut } = nextAuth;

/** Use in Server Components, actions, etc. Middleware uses `NextAuth(authConfig)` in `middleware.ts`. */
export async function auth(): Promise<Session | null> {
  if (isDesignPreviewActive()) {
    return getDesignPreviewSession();
  }
  return nextAuth.auth();
}
