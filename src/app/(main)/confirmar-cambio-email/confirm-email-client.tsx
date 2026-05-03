"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { confirmEmailChangeAction } from "@/app/actions/account-settings";
import { Button } from "@/components/ui/button";

export function ConfirmEmailClient({ token }: { token: string }) {
  const [phase, setPhase] = useState<"loading" | "error">("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await confirmEmailChangeAction(token);
      if (cancelled) return;
      if (!res.ok) {
        setError(res.error);
        setPhase("error");
        return;
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (phase === "loading") {
    return (
      <p className="text-sm text-muted-foreground">
        Confirmando el cambio de email…
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-destructive" role="alert">
        {error}
      </p>
      <Button asChild variant="outline" size="sm">
        <Link href="/mis-cosas/configuracion">Volver a configuración</Link>
      </Button>
    </div>
  );
}
