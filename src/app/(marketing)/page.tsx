import { HomeHero } from "@/components/home-hero";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ cuentaEliminada?: string }>;
}) {
  const { cuentaEliminada } = await searchParams;
  const showDeleted = cuentaEliminada === "1";

  return (
    <>
      {showDeleted ? (
        <div className="mx-auto w-full max-w-3xl px-4 pt-6">
          <p
            className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-center text-sm text-amber-950 dark:text-amber-100"
            role="status"
          >
            Tu cuenta fue eliminada. Gracias por haber pasado por encontrate.
          </p>
        </div>
      ) : null}
      <HomeHero />
    </>
  );
}
