"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { updateSignalListingAlerts } from "@/app/actions/signals";

type ActiveSignal = {
  id: string;
  listingAlertInApp: boolean;
  listingAlertEmail: boolean;
};

/**
 * "Configurar notificaciones" button + dialog for the Mis señales header.
 *
 * Notification preferences are stored per-Señal in the schema, but only the
 * ACTIVE signal triggers cron matching, so this dialog edits exclusively the
 * active signal's flags. When the user has no active signal the button is
 * disabled — there is nothing the cron would honour anyway.
 */
export function SignalNotificationsButton({
  activeSignal,
}: {
  activeSignal: ActiveSignal | null;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [inApp, setInApp] = React.useState(
    activeSignal?.listingAlertInApp ?? false,
  );
  const [email, setEmail] = React.useState(
    activeSignal?.listingAlertEmail ?? false,
  );
  const [error, setError] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();

  // Re-seed local state from props every time the dialog opens so "Cancelar"
  // truly discards in-flight changes and reflects the latest persisted truth.
  function handleOpenChange(next: boolean) {
    if (next && activeSignal) {
      setInApp(activeSignal.listingAlertInApp);
      setEmail(activeSignal.listingAlertEmail);
      setError(null);
    }
    setOpen(next);
  }

  function handleSave() {
    if (!activeSignal) return;
    setError(null);
    startTransition(async () => {
      const res = await updateSignalListingAlerts(activeSignal.id, {
        listingAlertInApp: inApp,
        listingAlertEmail: email,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setOpen(false);
      router.refresh();
    });
  }

  const disabled = !activeSignal;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      <DialogPrimitive.Trigger
        disabled={disabled}
        render={
          <Button type="button" variant="outline">
            Configurar notificaciones
          </Button>
        }
      />
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop
          data-slot="dialog-overlay"
          className="fixed inset-0 isolate z-50 bg-background/90 duration-100 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0"
        />
        <DialogPrimitive.Popup
          data-slot="dialog-content"
          className={cn(
            "fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-6 rounded-4xl bg-background p-6 text-sm ring-1 ring-foreground/5 duration-100 outline-none sm:max-w-lg data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
          )}
        >
          <div className="flex flex-col gap-2 pr-10">
            <DialogPrimitive.Title className="font-heading text-base leading-none font-medium">
              Configurá tus notificaciones
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="text-sm text-muted-foreground">
              Decinos si, y cómo, querés que te contactemos por habitaciones
              que te puedan servir.
            </DialogPrimitive.Description>
          </div>

          <div className="flex flex-col gap-2">
            <NotificationOption
              checked={inApp}
              onChange={setInApp}
              disabled={isPending}
              label="Quiero recibir mensajes sobre habitaciones que encajen con mi señal en la plataforma"
            />
            <NotificationOption
              checked={email}
              onChange={setEmail}
              disabled={isPending}
              label="Quiero recibir mensajes sobre habitaciones que encajen con mi señal por email"
            />
          </div>

          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <DialogPrimitive.Close
              render={
                <Button type="button" variant="outline" disabled={isPending}>
                  Cancelar
                </Button>
              }
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleSave}
              disabled={isPending}
            >
              {isPending ? "Guardando…" : "Guardar cambios"}
            </Button>
          </div>

          <DialogPrimitive.Close
            render={
              <Button
                variant="ghost"
                className="absolute top-4 right-4"
                size="icon-sm"
              />
            }
          >
            <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} />
            <span className="sr-only">Cerrar</span>
          </DialogPrimitive.Close>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

function NotificationOption({
  checked,
  onChange,
  disabled,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled: boolean;
  label: string;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-3 rounded-full border border-border bg-input/30 px-4 py-3 text-sm leading-snug transition-colors hover:bg-input/50",
        checked && "border-primary/60 bg-primary/10 hover:bg-primary/15",
        disabled && "cursor-not-allowed opacity-60 hover:bg-input/30",
      )}
    >
      <Checkbox
        checked={checked}
        disabled={disabled}
        onCheckedChange={(v) => onChange(v === true)}
        className="rounded-full"
      />
      <span>{label}</span>
    </label>
  );
}
