"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteSignal } from "@/app/actions/signals";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function SignalDeleteButton({
  signalId,
  className,
}: {
  signalId: string;
  /** Forwarded to the trigger button so callers can size it (e.g. `flex-1`). */
  className?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) setErr(null);
      }}
    >
      <Button
        type="button"
        size="sm"
        variant="destructive"
        className={className}
        onClick={() => setOpen(true)}
      >
        Eliminar
      </Button>
      <DialogContent className="max-w-md border-destructive/30">
        <DialogHeader>
          <DialogTitle className="text-destructive">Eliminar señal</DialogTitle>
          <DialogDescription>
            Se borrará la señal y sus fotos. No se puede deshacer.
          </DialogDescription>
        </DialogHeader>

        {err ? (
          <p className="text-sm text-destructive" role="alert">
            {err}
          </p>
        ) : null}

        <DialogFooter className="gap-2 sm:justify-between">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setOpen(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={() => {
              setErr(null);
              startTransition(async () => {
                const res = await deleteSignal(signalId);
                if (!res.ok) {
                  setErr(res.error);
                  return;
                }
                setOpen(false);
                router.refresh();
              });
            }}
          >
            {isPending ? "Eliminando…" : "Eliminar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
