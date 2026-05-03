"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import {
  deleteAccountAction,
  requestEmailChangeAction,
  updateWhatsappAction,
} from "@/app/actions/account-settings";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const inputDesign =
  "h-9 rounded-md border border-border bg-background shadow-[0px_1px_2px_0px_rgba(0,0,0,0.1)] placeholder:text-muted-foreground md:text-sm";

export type AccountSettingsPanelProps = {
  name: string | null;
  email: string | null;
  whatsappNumber: string | null;
  hasGoogleAccount: boolean;
  /** True when an Account row uses the credentials provider (password). */
  hasPasswordLogin: boolean;
  pendingEmailChange: { newEmail: string; expiresAt: string } | null;
};

export function AccountSettingsPanel({
  name,
  email,
  whatsappNumber,
  hasGoogleAccount,
  hasPasswordLogin,
  pendingEmailChange,
}: AccountSettingsPanelProps) {
  const router = useRouter();
  const [newEmail, setNewEmail] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailMsg, setEmailMsg] = useState<string | null>(null);
  const [emailErr, setEmailErr] = useState<string | null>(null);

  const [waInput, setWaInput] = useState(whatsappNumber ?? "");
  const [waLoading, setWaLoading] = useState(false);
  const [waMsg, setWaMsg] = useState<string | null>(null);
  const [waErr, setWaErr] = useState<string | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteAck, setDeleteAck] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteErr, setDeleteErr] = useState<string | null>(null);

  const phoneState = useMemo(() => {
    const trimmed = waInput.trim();
    if (!trimmed) return { ok: false, normalized: "", waLink: "" };
    const digitsOnly = trimmed.replace(/[^\d+]/g, "");
    const phone = parsePhoneNumberFromString(digitsOnly);
    const ok = Boolean(phone && phone.isValid());
    const normalized = phone?.number ?? "";
    const waLink = normalized ? `https://wa.me/${normalized.replace("+", "")}` : "";
    return { ok, normalized, waLink };
  }, [waInput]);

  async function onRequestEmailChange(e: React.FormEvent) {
    e.preventDefault();
    setEmailLoading(true);
    setEmailErr(null);
    setEmailMsg(null);
    const res = await requestEmailChangeAction(newEmail);
    setEmailLoading(false);
    if (!res.ok) {
      setEmailErr(res.error);
      return;
    }
    setEmailMsg(
      "Te enviamos un link al nuevo email. Tenés que abrirlo para que el cambio quede confirmado (vence en 24 h).",
    );
    setNewEmail("");
    router.refresh();
  }

  async function onSaveWhatsapp(e: React.FormEvent) {
    e.preventDefault();
    setWaLoading(true);
    setWaErr(null);
    setWaMsg(null);
    const res = await updateWhatsappAction(waInput);
    setWaLoading(false);
    if (!res.ok) {
      setWaErr(res.error);
      return;
    }
    setWaMsg("Número actualizado.");
    router.refresh();
  }

  async function onDeleteAccount() {
    setDeleteLoading(true);
    setDeleteErr(null);
    try {
      const res = await deleteAccountAction();
      if (!res.ok) {
        setDeleteErr(res.error);
        setDeleteLoading(false);
        return;
      }
    } catch {
      setDeleteLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <Card className="border border-border bg-card shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)]">
        <CardContent className="space-y-4 p-6 text-card-foreground">
          <div>
            <h2 className="text-lg font-semibold">Tu cuenta</h2>
            <p className="text-sm text-muted-foreground">
              Datos que usamos para contactarte y mostrar tu perfil.
            </p>
          </div>

          <dl className="grid gap-3 text-sm sm:grid-cols-[8rem_1fr] sm:gap-x-4">
            <dt className="text-muted-foreground">Nombre</dt>
            <dd className="font-medium">{name?.trim() || "—"}</dd>
            <dt className="text-muted-foreground">Email</dt>
            <dd className="break-all font-medium">{email ?? "—"}</dd>
            <dt className="text-muted-foreground">WhatsApp</dt>
            <dd className="font-medium">{whatsappNumber ?? "—"}</dd>
          </dl>

          {pendingEmailChange ? (
            <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-950 dark:text-amber-100">
              Cambio de email pendiente: te enviamos un link a{" "}
              <strong>{pendingEmailChange.newEmail}</strong>. El link vence el{" "}
              {new Date(pendingEmailChange.expiresAt).toLocaleString("es-ES", {
                dateStyle: "short",
                timeStyle: "short",
              })}
              .
            </p>
          ) : null}

          <Separator />

          <form onSubmit={onRequestEmailChange} className="space-y-3">
            <Label htmlFor="settings-new-email" className="text-sm font-medium">
              Cambiar email
            </Label>
            {hasGoogleAccount ? (
              <p className="text-sm text-muted-foreground">
                También usás Google para entrar. Si cambiás el email acá, la próxima vez
                podés seguir con Google o pedir un link al nuevo email.
              </p>
            ) : null}
            <Input
              id="settings-new-email"
              type="email"
              autoComplete="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="nuevo@email.com"
              className={cn(inputDesign, "max-w-md")}
            />
            {emailErr ? (
              <p className="text-sm text-destructive" role="alert">
                {emailErr}
              </p>
            ) : null}
            {emailMsg ? (
              <p className="text-sm text-card-foreground" role="status">
                {emailMsg}
              </p>
            ) : null}
            <Button type="submit" size="sm" disabled={emailLoading || !newEmail.trim()}>
              {emailLoading ? "Enviando…" : "Enviar link de confirmación"}
            </Button>
          </form>

          <Separator />

          <form onSubmit={onSaveWhatsapp} className="space-y-3">
            <Label htmlFor="settings-whatsapp" className="text-sm font-medium">
              Número de WhatsApp
            </Label>
            <Input
              id="settings-whatsapp"
              type="tel"
              autoComplete="tel"
              value={waInput}
              onChange={(e) => setWaInput(e.target.value)}
              placeholder="+34600111222"
              className={cn(inputDesign, "max-w-md")}
            />
            <p className="text-sm text-muted-foreground">
              Formato internacional (E.164), como en el registro.
              {waInput.trim() ? (
                phoneState.ok ? (
                  <>
                    {" "}
                    <span className="text-card-foreground">Formato OK.</span>
                    {phoneState.waLink ? (
                      <>
                        {" "}
                        <a
                          href={phoneState.waLink}
                          target="_blank"
                          rel="noreferrer"
                          className="underline underline-offset-2"
                        >
                          Abrir en WhatsApp
                        </a>
                      </>
                    ) : null}
                  </>
                ) : (
                  <>
                    {" "}
                    <span className="text-destructive">Número inválido.</span>
                  </>
                )
              ) : null}
            </p>
            {waErr ? (
              <p className="text-sm text-destructive" role="alert">
                {waErr}
              </p>
            ) : null}
            {waMsg ? (
              <p className="text-sm text-card-foreground" role="status">
                {waMsg}
              </p>
            ) : null}
            <Button type="submit" size="sm" disabled={waLoading || !phoneState.ok}>
              {waLoading ? "Guardando…" : "Guardar número"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border border-border bg-card shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)]">
        <CardContent className="space-y-3 p-6 text-card-foreground">
          <h2 className="text-lg font-semibold">Contraseña</h2>
          {hasPasswordLogin ? (
            <p className="text-sm text-muted-foreground">
              La gestión de contraseña para cuentas con email y contraseña se habilitará
              cuando esté disponible en la app.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Tu cuenta entra con <strong className="text-foreground">Google</strong> o
              con un <strong className="text-foreground">link mágico por email</strong>.
              No hay contraseña para cambiar.
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="border border-destructive/40 bg-card shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)]">
        <CardContent className="space-y-4 p-6 text-card-foreground">
          <div>
            <h2 className="text-lg font-semibold text-destructive">Eliminar cuenta</h2>
            <p className="text-sm text-muted-foreground">
              Vas a perder el acceso a favoritos, mensajes y reservas. Si sos anfitrión,
              también se eliminan tus anuncios y datos asociados. Esta acción es
              permanente.
            </p>
          </div>

          <Dialog
            open={deleteOpen}
            onOpenChange={(open) => {
              setDeleteOpen(open);
              if (!open) {
                setDeleteAck(false);
                setDeleteErr(null);
              }
            }}
          >
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => setDeleteOpen(true)}
            >
              Eliminar mi cuenta
            </Button>
            <DialogContent className="max-w-md border-destructive/30">
              <DialogHeader>
                <DialogTitle className="text-destructive">
                  ¿Eliminar la cuenta para siempre?
                </DialogTitle>
                <DialogDescription className="space-y-3 text-muted-foreground">
                  <span className="block">
                    No hay vuelta atrás: tu perfil, anuncios, reservas como huésped y
                    mensajes vinculados a esta cuenta se borran del sistema.
                  </span>
                  <span className="block font-medium text-foreground">
                    Si tenés reservas activas o anuncios publicados, considerá resolverlo
                    antes con las otras personas.
                  </span>
                </DialogDescription>
              </DialogHeader>

              <label className="flex cursor-pointer items-start gap-3 text-sm">
                <Checkbox
                  checked={deleteAck}
                  onCheckedChange={(v) => setDeleteAck(v === true)}
                  className="mt-0.5"
                />
                <span>
                  Entiendo que esta acción es <strong>definitiva</strong> y no se puede
                  deshacer.
                </span>
              </label>

              {deleteErr ? (
                <p className="text-sm text-destructive" role="alert">
                  {deleteErr}
                </p>
              ) : null}

              <DialogFooter className="gap-2 sm:justify-between">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setDeleteOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  size="sm"
                  disabled={!deleteAck || deleteLoading}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={onDeleteAccount}
                >
                  {deleteLoading ? "Eliminando…" : "Sí, eliminar mi cuenta"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <p className="text-xs text-muted-foreground">
            ¿Necesitás ayuda?{" "}
            <Link href="/contacto" className="underline underline-offset-2">
              Contactanos
            </Link>
            .
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
