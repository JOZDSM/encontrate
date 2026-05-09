"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateSignalListingAlerts } from "@/app/actions/signals";
import { Checkbox } from "@/components/ui/checkbox";

/**
 * Per-Señal "avísame de listings que matcheen" toggles. Owner-only. Surfaces
 * on the Mis señales card and saves on every change via the server action.
 */
export function SignalListingAlertsToggles({
  signalId,
  initialInApp,
  initialEmail,
  enabled,
}: {
  signalId: string;
  initialInApp: boolean;
  initialEmail: boolean;
  /** Hide the controls (e.g. for DRAFTs that can't receive alerts yet). */
  enabled: boolean;
}) {
  const router = useRouter();
  const [inApp, setInApp] = useState(initialInApp);
  const [email, setEmail] = useState(initialEmail);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!enabled) return null;

  function commit(next: { listingAlertInApp: boolean; listingAlertEmail: boolean }) {
    setError(null);
    startTransition(async () => {
      const res = await updateSignalListingAlerts(signalId, next);
      if (!res.ok) {
        setError(res.error);
        // Revert optimistic state so UI matches persisted truth.
        setInApp(initialInApp);
        setEmail(initialEmail);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-foreground">
        Avísame de habitaciones que coincidan
      </p>
      <div className="flex flex-wrap gap-3">
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <Checkbox
            checked={inApp}
            disabled={isPending}
            onCheckedChange={(v) => {
              const next = v === true;
              setInApp(next);
              commit({ listingAlertInApp: next, listingAlertEmail: email });
            }}
          />
          <span>En la plataforma</span>
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <Checkbox
            checked={email}
            disabled={isPending}
            onCheckedChange={(v) => {
              const next = v === true;
              setEmail(next);
              commit({ listingAlertInApp: inApp, listingAlertEmail: next });
            }}
          />
          <span>Por email</span>
        </label>
      </div>
      {error ? (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
