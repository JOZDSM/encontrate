import type { NextAuthConfig } from "next-auth";
import Resend from "next-auth/providers/resend";

export default {
  trustHost: true,
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/login", verifyRequest: "/login/verify" },
  providers: [
    Resend({
      // Auth.js docs default to AUTH_RESEND_KEY; this app uses RESEND_API_KEY.
      // Pass explicitly so the provider always has a key in production.
      apiKey: process.env.RESEND_API_KEY ?? process.env.AUTH_RESEND_KEY,
      from: process.env.EMAIL_FROM ?? "onboarding@resend.dev",
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        const u = user as { isAdmin?: boolean };
        token.isAdmin = u.isAdmin ?? false;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.isAdmin = Boolean(token.isAdmin);
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
