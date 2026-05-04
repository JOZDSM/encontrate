"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  deleteUserAction,
  denyUserAction,
} from "@/app/actions/admin-users";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function AdminUserActions({
  userId,
  mode,
}: {
  userId: string;
  mode: "deny" | "delete";
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const title =
    mode === "deny" ? "Rechazar cuenta" : "Eliminar cuenta";
  const description =
    mode === "deny"
      ? "Esto eliminará la cuenta pendiente. No se puede deshacer."
      : "Esto eliminará la cuenta aprobada y sus datos asociados. No se puede deshacer.";

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
        onClick={() => setOpen(true)}
      >
        {mode === "deny" ? "Rechazar" : "Eliminar"}
      </Button>
      <DialogContent className="max-w-md border-destructive/30">
        <DialogHeader>
          <DialogTitle className="text-destructive">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
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
                const res =
                  mode === "deny"
                    ? await denyUserAction(userId)
                    : await deleteUserAction(userId);
                if (!res.ok) {
                  setErr(res.error);
                  return;
                }
                setOpen(false);
                router.refresh();
              });
            }}
          >
            {isPending ? "Procesando…" : "Confirmar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

