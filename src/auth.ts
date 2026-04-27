import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { Session } from "next-auth";
import authConfig from "@/auth.config";
import { getDesignPreviewSession, isDesignPreviewActive } from "@/lib/design-preview";
import { parseAdminEmails } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email";

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

      // Notify admins that a new account was created (and is pending approval).
      const adminEmails = parseAdminEmails();
      if (adminEmails.length > 0) {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.encontrate.es";
        const subject = "Nuevo usuario registrado (pendiente de aprobación)";
        const html = `
          <p>Se registró un nuevo usuario en <strong>encontrate</strong> y está pendiente de aprobación.</p>
          <ul>
            <li><strong>Nombre</strong>: ${nextName ?? "—"}</li>
            <li><strong>Email</strong>: ${email}</li>
            <li><strong>WhatsApp</strong>: ${nextWhatsapp ?? "—"}</li>
          </ul>
          <p><a href="${appUrl}/admin">Abrir panel de admin</a></p>
        `;
        await Promise.all(
          adminEmails.map((to) =>
            sendEmail({ to, subject, html }).catch(() => {}),
          ),
        );
      }

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
  const session = await nextAuth.auth();
  if (!session?.user?.id) return session;

  try {
    const fresh = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isAdmin: true, isApproved: true },
    });
    if (fresh) {
      session.user.isAdmin = session.user.isAdmin || fresh.isAdmin;
      session.user.isApproved = fresh.isApproved;
    }
  } catch {
    // If the DB is temporarily unavailable/misconfigured, don't crash every page render.
    // Pages/actions that truly require DB access will fail in a more specific place.
  }
  return session;
}
