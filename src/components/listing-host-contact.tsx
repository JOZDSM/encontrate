"use client";

import { useMemo, useState } from "react";
import { Phone, Mail } from "lucide-react";
import { sendHostInquiry } from "@/app/actions/host-inquiry";
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

export function ListingHostContact({
  listingId,
  hostEmail,
  hostWhatsappNumber,
  showWhatsappOnListing,
  showEmailOnListing,
}: {
  listingId: string;
  hostEmail: string | null;
  hostWhatsappNumber: string | null;
  showWhatsappOnListing: boolean;
  showEmailOnListing: boolean;
}) {
  const [message, setMessage] = useState("");
  const [shareWhatsapp, setShareWhatsapp] = useState(false);
  const [shareEmail, setShareEmail] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const canSubmit = useMemo(() => message.trim().length >= 5, [message]);

  const phoneDisabled =
    !showWhatsappOnListing || !hostWhatsappNumber?.trim();
  const emailDisabled = !showEmailOnListing || !hostEmail?.trim();

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {phoneDisabled ? (
            <Button
              type="button"
              className="rounded-full"
              disabled
              title={
                !showWhatsappOnListing
                  ? "El anfitrión eligió no mostrar el teléfono en esta ficha."
                  : "El anfitrión no cargó teléfono."
              }
            >
              <Phone className="size-4" aria-hidden />
              Teléfono
            </Button>
          ) : (
            <Dialog>
              <DialogTrigger
                render={
                  <Button type="button" className="rounded-full">
                    <Phone className="size-4" aria-hidden />
                    Teléfono
                  </Button>
                }
              />
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Teléfono</DialogTitle>
                </DialogHeader>
                <div className="text-sm text-muted-foreground">
                  <p className="text-foreground">{hostWhatsappNumber}</p>
                </div>
              </DialogContent>
            </Dialog>
          )}

          {emailDisabled ? (
            <Button
              type="button"
              className="rounded-full"
              disabled
              title={
                !showEmailOnListing
                  ? "El anfitrión eligió no mostrar el email en esta ficha."
                  : "El anfitrión no cargó email."
              }
            >
              <Mail className="size-4" aria-hidden />
              Email
            </Button>
          ) : (
            <Dialog>
              <DialogTrigger
                render={
                  <Button type="button" className="rounded-full">
                    <Mail className="size-4" aria-hidden />
                    Email
                  </Button>
                }
              />
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Email</DialogTitle>
                </DialogHeader>
                <div className="text-sm text-muted-foreground">
                  <p className="text-foreground">{hostEmail}</p>
                </div>
              </DialogContent>
            </Dialog>
          )}

          <Dialog
            onOpenChange={(open) => {
              setError(null);
              setSuccess(null);
              // Reset opt-in toggles whenever the dialog opens or closes so
              // each new inquiry starts from a no-share default.
              if (!open) {
                setShareWhatsapp(false);
                setShareEmail(false);
              }
            }}
          >
            <DialogTrigger
              render={
                <Button type="button" className="rounded-full">
                  Enviar solicitud
                </Button>
              }
            />
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Enviar solicitud</DialogTitle>
                <DialogDescription>
                  Le haremos llegar tu mensaje al anfitrión. Podés elegir si
                  también le compartimos tu número de WhatsApp y/o email para
                  que se comunique contigo.
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
                  const res = await sendHostInquiry({
                    listingId,
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
                  <Label htmlFor="host-inquiry-message" className="sr-only">
                    Mensaje
                  </Label>
                  <Textarea
                    id="host-inquiry-message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={6}
                    placeholder="Escribí tu mensaje para el anfitrión…"
                    required
                  />
                </div>

                <div className="space-y-3">
                  <label className="flex cursor-pointer gap-3 rounded-2xl border border-border bg-muted/5 p-4 transition-colors hover:bg-muted/15">
                    <Checkbox
                      checked={shareWhatsapp}
                      onCheckedChange={(v) => setShareWhatsapp(v === true)}
                      className="mt-1 shrink-0"
                      id="host-inquiry-share-wa"
                    />
                    <div className="min-w-0 space-y-1">
                      <span className="block text-sm font-semibold text-foreground">
                        Compartir mi número de WhatsApp con el anfitrión
                      </span>
                      <span className="block text-sm leading-5 text-muted-foreground">
                        Si lo marcás, el anfitrión podrá escribirte directo a
                        WhatsApp.
                      </span>
                    </div>
                  </label>

                  <label className="flex cursor-pointer gap-3 rounded-2xl border border-border bg-muted/5 p-4 transition-colors hover:bg-muted/15">
                    <Checkbox
                      checked={shareEmail}
                      onCheckedChange={(v) => setShareEmail(v === true)}
                      className="mt-1 shrink-0"
                      id="host-inquiry-share-email"
                    />
                    <div className="min-w-0 space-y-1">
                      <span className="block text-sm font-semibold text-foreground">
                        Compartir mi email con el anfitrión
                      </span>
                      <span className="block text-sm leading-5 text-muted-foreground">
                        Si lo marcás, el anfitrión podrá responderte por email
                        fuera de la plataforma.
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
        </div>
      </div>
    </div>
  );
}
