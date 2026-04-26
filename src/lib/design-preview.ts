import type { Session } from "next-auth";

/**
 * Local-only “signed in” facade for UI work without magic links or DB users.
 * Never active when NODE_ENV === "production", even if the env var is set.
 */
export function isDesignPreviewActive(): boolean {
  if (process.env.NODE_ENV === "production") return false;
  const v = process.env.DESIGN_PREVIEW?.trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

function previewUserId(): string {
  const fromEnv = process.env.DESIGN_PREVIEW_USER_ID?.trim();
  if (fromEnv) return fromEnv;
  // Deliberately unlikely to match a real host — empty host dashboards, writes need DESIGN_PREVIEW_USER_ID.
  return "cldesignpreview000hr000000000";
}

export function isDesignPreviewSession(session: Session | null): boolean {
  return Boolean(session?.user?.designPreview);
}

export function designPreviewAllowsEditAnyListing(): boolean {
  if (!isDesignPreviewActive()) return false;
  const v = process.env.DESIGN_PREVIEW_EDIT_ANY_LISTING?.trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

export function designPreviewAsAdmin(): boolean {
  if (!isDesignPreviewActive()) return false;
  const v = process.env.DESIGN_PREVIEW_AS_ADMIN?.trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

export function getDesignPreviewSession(): Session {
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  return {
    user: {
      id: previewUserId(),
      name: "Vista diseño",
      email: "design-preview@local.invalid",
      image: null,
      isAdmin: designPreviewAsAdmin(),
      designPreview: true,
    },
    expires,
  };
}

/** When set, mutations are allowed to use the mapped User row; otherwise block to avoid FK errors and accidental writes. */
export function designPreviewWriteBlockedMessage(session: Session | null): string | null {
  if (!session?.user?.designPreview) return null;
  if (process.env.DESIGN_PREVIEW_USER_ID?.trim()) return null;
  return "Modo diseño: en .env.local define DESIGN_PREVIEW_USER_ID con un id de usuario real (Prisma) para guardar, o desactiva DESIGN_PREVIEW.";
}
