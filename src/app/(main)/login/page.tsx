import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { isDesignPreviewSession } from "@/lib/design-preview";
import {
  parseSafeCallbackUrl,
  resolveAuthLandingPath,
} from "@/lib/post-auth-redirect";
import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ emailActualizado?: string; callbackUrl?: string }>;
}) {
  const session = await auth();
  const { emailActualizado, callbackUrl } = await searchParams;

  if (session?.user?.id && !isDesignPreviewSession(session)) {
    redirect(resolveAuthLandingPath(session, callbackUrl));
  }

  const showEmailUpdated = emailActualizado === "1";
  const authCallbackUrl = parseSafeCallbackUrl(callbackUrl) ?? "/mis-cosas";

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col items-center justify-start px-4 pt-24 pb-24 md:pt-32 md:pb-10">
      <div className="flex w-full max-w-[704px] flex-col items-center gap-6">
        {showEmailUpdated ? (
          <p
            className="w-full rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-center text-sm text-emerald-950 dark:text-emerald-100"
            role="status"
          >
            Email actualizado. Iniciá sesión de nuevo con tu nuevo email (link mágico o
            Google).
          </p>
        ) : null}
        <LoginForm callbackUrl={authCallbackUrl} />
      </div>
    </div>
  );
}
