import type { NextAuthConfig } from "next-auth";
import Resend from "next-auth/providers/resend";
import Google from "next-auth/providers/google";

export default {
  trustHost: true,
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/login", verifyRequest: "/login/verify" },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      // Users may have created an account via magic-link first.
      // Allow linking Google to the same email to avoid OAuthAccountNotLinked.
      allowDangerousEmailAccountLinking: true,
    }),
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
        const u = user as { isAdmin?: boolean; isApproved?: boolean };
        token.isAdmin = u.isAdmin ?? false;
        token.isApproved = u.isApproved ?? false;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.isAdmin = Boolean(token.isAdmin);
        session.user.isApproved = Boolean(token.isApproved);
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
