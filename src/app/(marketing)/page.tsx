import { HomeServicesCatalog } from "@/components/home-services-catalog";
import { getCatalogRows } from "@/lib/service-catalog";
import {
  MOCK_CATEGORY_ROWS,
  MOCK_RECENT_SERVICES,
} from "@/lib/mock-services-catalog";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ cuentaEliminada?: string }>;
}) {
  const { cuentaEliminada } = await searchParams;
  const showDeleted = cuentaEliminada === "1";

  let recent = MOCK_RECENT_SERVICES;
  let categories = MOCK_CATEGORY_ROWS;
  try {
    const catalog = await getCatalogRows();
    if (catalog.recent.length > 0) recent = catalog.recent;
    if (catalog.categories.length > 0) categories = catalog.categories;
  } catch {
    // Fall back to mock catalog if DB is unavailable.
  }

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
      <HomeServicesCatalog recent={recent} categories={categories} />
    </>
  );
}
