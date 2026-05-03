import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ emailActualizado?: string }>;
}) {
  const { emailActualizado } = await searchParams;
  const showEmailUpdated = emailActualizado === "1";

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
        <LoginForm />
      </div>
    </div>
  );
}
