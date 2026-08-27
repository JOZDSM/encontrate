"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { CatalogSearchOverlay } from "@/components/catalog-search-overlay";
import { captureCatalogueSearchOpened } from "@/lib/catalogue-analytics";
import type { ServiceOffering } from "@/lib/mock-services-catalog";

type CatalogSearchContextValue = {
  open: boolean;
  openSearch: () => void;
  closeSearch: () => void;
  services: ServiceOffering[];
  setServices: (services: ServiceOffering[]) => void;
};

const CatalogSearchContext = createContext<CatalogSearchContextValue | null>(
  null,
);

export function useCatalogSearch(): CatalogSearchContextValue {
  const ctx = useContext(CatalogSearchContext);
  if (!ctx) {
    throw new Error("useCatalogSearch must be used within CatalogSearchProvider");
  }
  return ctx;
}

/** Optional hook when the provider may be absent (non-catalog pages). */
export function useOptionalCatalogSearch(): CatalogSearchContextValue | null {
  return useContext(CatalogSearchContext);
}

async function fetchPublishedCatalogServices(): Promise<ServiceOffering[]> {
  const res = await fetch("/api/catalog/services", {
    method: "GET",
    credentials: "same-origin",
    cache: "no-store",
  });
  if (!res.ok) return [];
  const body = (await res.json()) as { services?: ServiceOffering[] };
  return Array.isArray(body.services) ? body.services : [];
}

export function CatalogSearchProvider({
  children,
  initialServices = [],
}: {
  children: React.ReactNode;
  initialServices?: ServiceOffering[];
}) {
  const [open, setOpen] = useState(false);
  const [services, setServicesState] =
    useState<ServiceOffering[]>(initialServices);

  const setServices = useCallback((next: ServiceOffering[]) => {
    setServicesState(next);
  }, []);

  const refreshServices = useCallback(async () => {
    try {
      const next = await fetchPublishedCatalogServices();
      if (next.length > 0) setServicesState(next);
    } catch {
      // Keep whatever is already in memory (homepage props or prior fetch).
    }
  }, []);

  const openSearch = useCallback(() => {
    setOpen(true);
    captureCatalogueSearchOpened();
    void refreshServices();
  }, [refreshServices]);
  const closeSearch = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (initialServices.length > 0) {
      setServicesState(initialServices);
    }
  }, [initialServices]);

  // Load published DB services on mount so search works on service pages too,
  // not only after visiting the homepage (which used to be the only refresh path).
  useEffect(() => {
    void refreshServices();
  }, [refreshServices]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "e" && event.key !== "E") return;
      if (open) return;
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT")
      ) {
        return;
      }
      event.preventDefault();
      openSearch();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, openSearch]);

  const value = useMemo(
    () => ({ open, openSearch, closeSearch, services, setServices }),
    [open, openSearch, closeSearch, services, setServices],
  );

  return (
    <CatalogSearchContext.Provider value={value}>
      {children}
      <CatalogSearchOverlay
        open={open}
        onClose={closeSearch}
        services={services}
      />
    </CatalogSearchContext.Provider>
  );
}
