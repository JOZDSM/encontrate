import type { Session } from "next-auth";
import { isUserApproved } from "@/lib/approval";
import { isUserProfileComplete } from "@/lib/profile";

export const DEFAULT_POST_AUTH_PATH = "/mis-cosas";

/** Where an authenticated user should land after sign-in (profile + approval gates). */
export function resolvePostAuthPath(session: Session | null): string {
  if (!session?.user?.id) return "/login";
  if (!isUserProfileComplete(session)) return "/onboarding";
  if (!isUserApproved(session)) return "/pending";
  return DEFAULT_POST_AUTH_PATH;
}

/** Only allow same-origin relative paths as callback targets. */
export function parseSafeCallbackUrl(value: string | undefined | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return null;
  return trimmed;
}

/** Honors callbackUrl only when profile and approval gates are satisfied. */
export function resolveAuthLandingPath(
  session: Session | null,
  requestedCallbackUrl?: string | null,
): string {
  const gatePath = resolvePostAuthPath(session);
  if (gatePath !== DEFAULT_POST_AUTH_PATH) return gatePath;
  return parseSafeCallbackUrl(requestedCallbackUrl) ?? DEFAULT_POST_AUTH_PATH;
}
