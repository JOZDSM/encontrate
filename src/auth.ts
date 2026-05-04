import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { Session } from "next-auth";
import authConfig from "@/auth.config";
import { getDesignPreviewSession, isDesignPreviewActive } from "@/lib/design-preview";
import { parseAdminEmails } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email";

function escapeHtml(raw: string): string {
  return raw
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

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

      const pending = await findSignupProfileByEmail(email);
      if (pending) {
        if (pending.expiresAt.getTime() < Date.now()) {
          await prisma.signupProfile
            .delete({ where: { email: pending.email } })
            .catch(() => {});
        } else {
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
      const displayWhatsapp = fresh?.whatsappNumber?.trim() || "—";
      const provider = account?.provider ?? "unknown";
      const providerAccountId = account?.providerAccountId ?? "—";

      const adminEmails = parseAdminEmails();
      if (adminEmails.length === 0) {
        console.warn("[admin notify skipped] ADMIN_EMAILS is empty", {
          newUserEmail: email,
          provider,
        });
        return;
      }

      const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "https://www.encontrate.es").replace(
        /\/$/,
        "",
      );
      const subject = "Nuevo usuario registrado (pendiente de aprobación)";
      const html = `
        <p>Se registró un nuevo usuario en <strong>encontrate</strong> y está pendiente de aprobación.</p>
        <ul>
          <li><strong>Nombre</strong>: ${escapeHtml(displayName)}</li>
          <li><strong>Email</strong>: ${escapeHtml(email)}</li>
          <li><strong>WhatsApp</strong>: ${escapeHtml(displayWhatsapp)}</li>
          <li><strong>Proveedor</strong>: ${escapeHtml(provider)}</li>
          <li><strong>Provider account id</strong>: ${escapeHtml(providerAccountId)}</li>
          <li><strong>Aprobado</strong>: ${fresh?.isApproved ? "sí" : "no"}</li>
        </ul>
        <p><a href="${escapeHtml(appUrl)}/admin">Abrir panel de admin</a></p>
      `;

      await Promise.all(
        adminEmails.map(async (to) => {
          try {
            await sendEmail({ to, subject, html });
          } catch (err) {
            console.error("[admin notify failed]", { to, subject, err });
          }
        }),
      );
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
