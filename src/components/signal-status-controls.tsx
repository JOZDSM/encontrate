"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { deactivateSignal, setActiveSignal } from "@/app/actions/signals";

/**
 * Owner-only "Activar / Desactivar" button shown on the public Señal detail
 * page. Mutating the status revalidates the page from the server actions, and
 * we also call `router.refresh()` so the detail page reflects the new status
 * without a full reload.
 */
export function SignalStatusControls({
  signalId,
  status,
}: {
  signalId: string;
  status: "DRAFT" | "ACTIVE" | "INACTIVE";
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  if (status === "DRAFT") {
    return null;
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          if (status === "ACTIVE") {
            await deactivateSignal(signalId);
          } else {
            await setActiveSignal(signalId);
          }
          router.refresh();
        });
      }}
    >
      {pending
        ? status === "ACTIVE"
          ? "Desactivando…"
          : "Activando…"
        : status === "ACTIVE"
          ? "Desactivar"
          : "Activar"}
    </Button>
  );
}
