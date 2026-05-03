import type { Session } from "next-auth";
import { isPlatformAdmin } from "@/lib/admin";
import { designPreviewAllowsEditAnyListing } from "@/lib/design-preview";

/** Host, platform admin, or design-preview “edit any listing” (local). */
export function canEditListingAsOwnerOrAdmin(
  session: Session | null,
  listingHostId: string,
): boolean {
  if (!session?.user?.id) return false;
  if (isPlatformAdmin(session)) return true;
  if (
    designPreviewAllowsEditAnyListing() &&
    Boolean(session.user.designPreview)
  ) {
    return true;
  }
  return listingHostId === session.user.id;
}
