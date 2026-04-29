import type { Session } from "next-auth";
import { isPlatformAdmin } from "@/lib/admin";

export function isUserProfileComplete(session: Session | null): boolean {
  if (!session?.user?.id) return false;
  if (isPlatformAdmin(session)) return true;
  return Boolean(session.user.whatsappNumber);
}

