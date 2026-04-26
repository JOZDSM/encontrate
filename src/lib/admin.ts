import type { Session } from "next-auth";

export function parseAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS ?? "";
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isPlatformAdmin(session: Session | null): boolean {
  if (!session?.user?.email) return false;
  const email = session.user.email.toLowerCase();
  if (session.user.isAdmin) return true;
  return parseAdminEmails().includes(email);
}
