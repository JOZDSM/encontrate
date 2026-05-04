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

export type AdminPendingUserEmailVariant = "initial" | "whatsapp_added";

export async function notifyAdminsPendingUser({
  displayName,
  email,
  displayWhatsapp,
  provider,
  providerAccountId,
  isApproved,
  variant = "initial",
}: {
  displayName: string;
  email: string;
  displayWhatsapp: string;
  provider: string;
  providerAccountId: string;
  isApproved: boolean;
  variant?: AdminPendingUserEmailVariant;
}): Promise<void> {
  const adminEmails = parseAdminEmails();
  if (adminEmails.length === 0) {
    console.warn("[admin notify skipped] ADMIN_EMAILS is empty", {
      newUserEmail: email,
      provider,
      variant,
    });
    return;
  }

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "https://www.encontrate.es").replace(
    /\/$/,
    "",
  );

  const subject =
    variant === "whatsapp_added"
      ? "Usuario pendiente: completó número de WhatsApp"
      : "Nuevo usuario registrado (pendiente de aprobación)";

  const intro =
    variant === "whatsapp_added"
      ? `<p>Un usuario <strong>pendiente de aprobación</strong> completó su número de WhatsApp (por ejemplo después de iniciar sesión con Google sin pasar por el formulario de registro).</p>`
      : `<p>Se registró un nuevo usuario en <strong>encontrate</strong> y está pendiente de aprobación.</p>`;

  const html = `
        ${intro}
        <ul>
          <li><strong>Nombre</strong>: ${escapeHtml(displayName)}</li>
          <li><strong>Email</strong>: ${escapeHtml(email)}</li>
          <li><strong>WhatsApp</strong>: ${escapeHtml(displayWhatsapp)}</li>
          <li><strong>Proveedor</strong>: ${escapeHtml(provider)}</li>
          <li><strong>Provider account id</strong>: ${escapeHtml(providerAccountId)}</li>
          <li><strong>Aprobado</strong>: ${isApproved ? "sí" : "no"}</li>
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
}

/** When a not-yet-approved user had no WhatsApp on file and saves one (e.g. onboarding or settings). */
export async function notifyAdminsIfPendingUserAddedFirstWhatsapp(opts: {
  userId: string;
  hadWhatsappBefore: boolean;
  wasApprovedBefore: boolean;
  email: string;
  displayName: string;
  whatsapp: string;
}): Promise<void> {
  const wa = opts.whatsapp.trim();
  const em = opts.email.trim();
  if (
    opts.wasApprovedBefore ||
    opts.hadWhatsappBefore ||
    !wa ||
    !em
  ) {
    return;
  }

  const account = await prisma.account.findFirst({
    where: { userId: opts.userId },
    orderBy: { id: "asc" },
    select: { provider: true, providerAccountId: true },
  });

  await notifyAdminsPendingUser({
    displayName: opts.displayName.trim() || "—",
    email: em,
    displayWhatsapp: wa,
    provider: account?.provider ?? "—",
    providerAccountId: account?.providerAccountId ?? "—",
    isApproved: false,
    variant: "whatsapp_added",
  });
}
