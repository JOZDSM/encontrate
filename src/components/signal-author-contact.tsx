"use client";

import { useMemo, useState } from "react";
import { sendSignalInquiry } from "@/app/actions/host-inquiry";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

/**
 * Mirror of `<ListingHostContact />` for the Señal detail page. Anyone who is
 * not the Señal author can open this dialog to send an in-platform message;
 * checkboxes opt the sender into sharing their email and/or WhatsApp.
 */
export function SignalAuthorContact({ signalId }: { signalId: string }) {
  const [message, setMessage] = useState("");
  const [shareWhatsapp, setShareWhatsapp] = useState(false);
  const [shareEmail, setShareEmail] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const canSubmit = useMemo(() => message.trim().length >= 5, [message]);

  return (
    <Dialog
      onOpenChange={(open) => {
        setError(null);
        setSuccess(null);
        if (!open) {
          setShareWhatsapp(false);
          setShareEmail(false);
        }
      }}
    >
      <DialogTrigger
        render={
          <Button type="button" className="rounded-full">
            Contactar
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Contactar</DialogTitle>
          <DialogDescription>
            Le haremos llegar tu mensaje al autor de la señal. Podés elegir si
            también le compartimos tu email y/o WhatsApp para que te responda.
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!canSubmit || sending) return;
            setSending(true);
            setError(null);
            setSuccess(null);
            const res = await sendSignalInquiry({
              signalId,
              message,
              shareWhatsapp,
              shareEmail,
            });
            setSending(false);
            if (!res.ok) {
              setError(res.error);
              return;
            }
            setMessage("");
            setShareWhatsapp(false);
            setShareEmail(false);
            setSuccess("Solicitud enviada.");
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="signal-inquiry-message" className="sr-only">
              Mensaje
            </Label>
            <Textarea
              id="signal-inquiry-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              placeholder="Contale por qué te parece un buen match y qué tenés para ofrecer…"
              required
            />
          </div>

          <div className="space-y-3">
            <label className="flex cursor-pointer gap-3 rounded-2xl border border-border bg-muted/5 p-4 transition-colors hover:bg-muted/15">
              <Checkbox
                checked={shareWhatsapp}
                onCheckedChange={(v) => setShareWhatsapp(v === true)}
                className="mt-1 shrink-0"
                id="signal-inquiry-share-wa"
              />
              <div className="min-w-0 space-y-1">
                <span className="block text-sm font-semibold text-foreground">
                  Compartir mi número de WhatsApp
                </span>
                <span className="block text-sm leading-5 text-muted-foreground">
                  Si lo marcás, podrá escribirte directo a WhatsApp.
                </span>
              </div>
            </label>

            <label className="flex cursor-pointer gap-3 rounded-2xl border border-border bg-muted/5 p-4 transition-colors hover:bg-muted/15">
              <Checkbox
                checked={shareEmail}
                onCheckedChange={(v) => setShareEmail(v === true)}
                className="mt-1 shrink-0"
                id="signal-inquiry-share-email"
              />
              <div className="min-w-0 space-y-1">
                <span className="block text-sm font-semibold text-foreground">
                  Compartir mi email
                </span>
                <span className="block text-sm leading-5 text-muted-foreground">
                  Si lo marcás, podrá responderte fuera de la plataforma.
                </span>
              </div>
            </label>
          </div>

          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          {success ? (
            <p className="text-sm font-medium text-foreground" role="status">
              {success}
            </p>
          ) : null}

          <div className="flex justify-end">
            <Button
              type="submit"
              className="rounded-full"
              disabled={sending || !canSubmit}
            >
              {sending ? "Enviando…" : "Enviar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
