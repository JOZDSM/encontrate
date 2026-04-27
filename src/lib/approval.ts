import type { Session } from "next-auth";
import { isPlatformAdmin } from "@/lib/admin";

export function isUserApproved(session: Session | null): boolean {
  // Platform admins always bypass approval (either DB flag or ADMIN_EMAILS).
  if (isPlatformAdmin(session)) return true;
  return Boolean(session?.user?.isApproved);
}

