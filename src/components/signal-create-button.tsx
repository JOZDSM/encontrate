"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { createDraftSignal } from "@/app/actions/signals";
import { Button } from "@/components/ui/button";

/**
 * "Crear nueva señal" button — used in the Mis señales sub-section. Always
 * forces a brand-new DRAFT (vs. resuming the existing one), then routes the
 * user into `/signals/[id]/editar` to start filling it in.
 */
export function SignalCreateButton({ children }: { children?: React.ReactNode }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          const res = await createDraftSignal({ force: true });
          if (!res.ok) return;
          router.push(`/signals/${res.id}/editar`);
        });
      }}
    >
      {isPending ? "Creando…" : (children ?? "Crear nueva señal")}
    </Button>
  );
}
