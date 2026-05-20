"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { deactivateSignal, setActiveSignal } from "@/app/actions/signals";
import { cn } from "@/lib/utils";

/**
 * Owner-only "Activar / Desactivar" button.
 *
 * Two visual variants share the same server-action wiring:
 *   - `toolbar` — short label (`Activar` / `Desactivar`), used on the public
 *     Señal detail page next to other small action buttons.
 *   - `card`    — long label (`Activar esta señal` / `Desactivar esta señal`),
 *     used as the prominent CTA row on the Mis señales card. Becomes full-width
 *     when `fullWidth` is set.
 *
 * `DRAFT` Señales render nothing in either variant; the "Completar publicación"
 * affordance for drafts is owned by the card so it can deep-link to the wizard
 * without duplicating the activate/deactivate state machine here.
 */
export function SignalStatusControls({
  signalId,
  status,
  variant = "toolbar",
  fullWidth = false,
  className,
}: {
  signalId: string;
  status: "DRAFT" | "ACTIVE" | "INACTIVE";
  variant?: "toolbar" | "card";
  fullWidth?: boolean;
  className?: string;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  if (status === "DRAFT") {
    return null;
  }

  const isCard = variant === "card";
  const buttonVariant = isCard
    ? status === "ACTIVE"
      ? "outline"
      : "default"
    : "outline";

  const label = (() => {
    if (pending) {
      return status === "ACTIVE" ? "Desactivando…" : "Activando…";
    }
    if (isCard) {
      return status === "ACTIVE" ? "Desactivar esta señal" : "Activar esta señal";
    }
    return status === "ACTIVE" ? "Desactivar" : "Activar";
  })();

  return (
    <Button
      type="button"
      variant={buttonVariant}
      size="sm"
      disabled={pending}
      className={cn(fullWidth && "w-full", className)}
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
      {label}
    </Button>
  );
}
