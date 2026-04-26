import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import authConfig from "@/auth.config";
import { isDesignPreviewActive } from "@/lib/design-preview";
import { prisma } from "@/lib/db";

const { auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
});

export default auth((req) => {
  if (isDesignPreviewActive()) {
    return;
  }
  if (!req.auth) {
    const login = new URL("/login", req.nextUrl.origin);
    login.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return Response.redirect(login);
  }
});

export const config = {
  matcher: [
    "/host/:path*",
    "/dashboard/:path*",
    "/admin/:path*",
    "/listings/:path*",
  ],
};

