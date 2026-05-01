"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const TOTAL_STEPS = 6;

export function HostListingWizard() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);

  // Step 1: listing title only for now.
  const [title, setTitle] = useState("");

  const canGoNext = useMemo(() => title.trim().length > 0, [title]);
  const progressValue = Math.min(1, Math.max(0, (stepIndex + 1) / TOTAL_STEPS));

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-1 items-center justify-center px-4 py-10">
      <Card className="flex w-full max-w-[1220px] flex-col border border-border bg-card shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)]">
        <CardContent className="flex min-h-[560px] flex-1 flex-col p-6 text-card-foreground">
          <div className="mx-auto flex w-full max-w-[730px] flex-1 flex-col justify-center">
            {stepIndex === 0 ? (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h1 className="text-[36px] leading-[40px] font-extrabold">
                    Dale un nombre a tu habitación
                  </h1>
                  <p className="text-sm leading-5 text-muted-foreground">
                    Los títulos cortos que resaltan dónde está el piso (y qué lo
                    destaca) funcionan mejor.
                  </p>
                </div>

                <div className="w-full">
                  <Textarea
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    rows={2}
                    className="min-h-20"
                    placeholder="Ej. Habitación doble con balcón a 3 minutos de la Sagrada Familia."
                    aria-label="Título del anuncio"
                  />
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground text-sm">
                Paso {stepIndex + 1} de {TOTAL_STEPS} (pendiente de diseño).
              </div>
            )}
          </div>

          <div className="mt-auto h-[92px] border-t border-border pt-4">
            <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-foreground transition-[width] duration-300 ease-out"
                style={{ width: `${Math.round(progressValue * 100)}%` }}
              />
            </div>

            <div className="mt-4 flex items-center justify-between">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className={cn("rounded-full")}
                onClick={() => {
                  if (stepIndex === 0) router.back();
                  else setStepIndex((s) => Math.max(0, s - 1));
                }}
              >
                Atrás
              </Button>

              <Button
                type="button"
                size="sm"
                className="rounded-full"
                disabled={stepIndex === 0 ? !canGoNext : false}
                onClick={() =>
                  setStepIndex((s) => Math.min(TOTAL_STEPS - 1, s + 1))
                }
              >
                Siguiente
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

