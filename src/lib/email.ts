import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!resend || !process.env.EMAIL_FROM) {
    console.info("[email skipped]", opts.subject, "→", opts.to);
    return;
  }
  await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
  });
}
