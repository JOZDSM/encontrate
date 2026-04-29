import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      isAdmin?: boolean;
      isApproved?: boolean;
      whatsappNumber?: string | null;
      /** Set when SESSION comes from DESIGN_PREVIEW (local dev only). */
      designPreview?: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    isAdmin?: boolean;
    isApproved?: boolean;
  }
}
