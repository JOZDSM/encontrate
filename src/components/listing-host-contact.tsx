"use client";

import { useMemo, useState } from "react";
import { Phone, Mail } from "lucide-react";
import { sendHostInquiry } from "@/app/actions/host-inquiry";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ListingHostContact({
  listingId,
  hostName,
  hostEmail,
  hostWhatsappNumber,
}: {
  listingId: string;
  hostName: string;
  hostEmail: string | null;
  hostWhatsappNumber: string | null;
}) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const canSubmit = useMemo(() => message.trim().length >= 5, [message]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Publicado por <span className="font-medium text-foreground">{hostName}</span>
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <Dialog>
            <DialogTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 rounded-2xl px-5"
                >
                  <Phone className="mr-3 size-6" aria-hidden />
                  <span className="text-base font-semibold">Teléfono</span>
                </Button>
              }
            />
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Teléfono</DialogTitle>
              </DialogHeader>
              <div className="text-sm text-muted-foreground">
                {hostWhatsappNumber ? (
                  <p className="text-foreground">{hostWhatsappNumber}</p>
                ) : (
                  <p>El anfitrión no cargó teléfono.</p>
                )}
              </div>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 rounded-2xl px-5"
                >
                  <Mail className="mr-3 size-6" aria-hidden />
                  <span className="text-base font-semibold">Email</span>
                </Button>
              }
            />
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Email</DialogTitle>
              </DialogHeader>
              <div className="text-sm text-muted-foreground">
                {hostEmail ? (
                  <p className="text-foreground">{hostEmail}</p>
                ) : (
                  <p>El anfitrión no cargó email.</p>
                )}
              </div>
            </DialogContent>
          </Dialog>

          <Dialog
            onOpenChange={() => {
              setError(null);
              setSuccess(null);
            }}
          >
            <DialogTrigger
              render={
                <Button
                  type="button"
                  className="h-12 rounded-2xl px-5 text-base font-semibold"
                >
                  Enviar solicitud
                </Button>
              }
            />
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Enviar solicitud</DialogTitle>
              </DialogHeader>
              <form
                className="space-y-4"
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!canSubmit || sending) return;
                  setSending(true);
                  setError(null);
                  setSuccess(null);
                  const res = await sendHostInquiry({ listingId, message });
                  setSending(false);
                  if (!res.ok) {
                    setError(res.error);
                    return;
                  }
                  setMessage("");
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

