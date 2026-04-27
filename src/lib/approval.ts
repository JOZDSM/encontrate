import type { Session } from "next-auth";

export function isUserApproved(session: Session | null): boolean {
  // Admins always bypass approval.
  if (session?.user?.isAdmin) return true;
  return Boolean(session?.user?.isApproved);
}

