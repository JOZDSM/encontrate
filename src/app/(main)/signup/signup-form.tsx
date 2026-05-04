"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { signIn } from "next-auth/react";
import posthog from "posthog-js";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { upsertSignupProfileAction } from "@/app/actions/signup";
import { parsePhoneNumberFromString } from "libphonenumber-js";

const inputDesign =
  "h-9 rounded-md border border-border bg-background shadow-[0px_1px_2px_0px_rgba(0,0,0,0.1)] placeholder:text-muted-foreground md:text-sm";

export function SignupForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const phoneState = useMemo(() => {
    const trimmed = whatsappNumber.trim();
    if (!trimmed) return { ok: false, normalized: "", waLink: "" };
    const digitsOnly = trimmed.replace(/[^\d+]/g, "");
    const phone = parsePhoneNumberFromString(digitsOnly);
    const ok = Boolean(phone && phone.isValid());
    const normalized = phone?.number ?? "";
    const waLink = normalized ? `https://wa.me/${normalized.replace("+", "")}` : "";
    return { ok, normalized, waLink };
  }, [whatsappNumber]);

  const nameOk = name.trim().length > 0;
  const emailOk = email.trim().length > 0;
  const formOk = nameOk && emailOk && phoneState.ok;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await upsertSignupProfileAction({
        email,
        name,
        whatsappNumber: phoneState.normalized || whatsappNumber,
      });
      posthog.capture("signup_profile_submitted");
    } catch {
      setLoading(false);
      setError(
        "Revisá los campos: nombre, email y número de WhatsApp (formato internacional, ej: +34600111222).",
      );
      posthog.capture("signup_profile_error");
      return;
    }

    const res = await signIn("resend", {
      email,
      redirect: false,
      callbackUrl: "/mis-cosas",
    });

    setLoading(false);
    if (res?.error) {
      setError("No se pudo enviar el link. Revisá tu email y RESEND_API_KEY.");
      posthog.capture("signup_magic_link_error");
      return;
    }
    posthog.capture("signup_magic_link_sent");
    window.location.href = "/login/verify";
  }

  async function onGoogle() {
    setLoading(true);
    setError(null);
    try {
      await upsertSignupProfileAction({
        email,
        name,
        whatsappNumber: phoneState.normalized || whatsappNumber,
      });
      posthog.capture("signup_google_clicked");
    } catch {
      setLoading(false);
      setError(
        "Revisá los campos: nombre, email y número de WhatsApp (formato internacional, ej: +34600111222).",
      );
      posthog.capture("signup_profile_error");
      return;
    }
    // Google sign-in will pick up the stored SignupProfile on signIn event.
    await signIn("google", { callbackUrl: "/mis-cosas" });
    setLoading(false);
  }

  return (
    <Card
      className={cn(
        "w-full max-w-[704px] gap-0 rounded-xl border border-border bg-card py-6 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)] ring-0",
      )}
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2 px-6">
          <h1 className="text-base font-semibold tracking-normal text-card-foreground">
            Creá tu cuenta
          </h1>
          <p className="text-sm leading-5 text-muted-foreground">
            Ingresá tu información acá para poder cargar o buscar habitaciones.
          </p>
          <p className="text-sm leading-5 text-muted-foreground">
            Cuánta información personal querés darnos es tu elección — obviamente
            más transparencia genera más confianza, pero si querés mantener tu
            privacidad y establecer el vínculo anfitrión/huesped por fuera,
            también es válido 😉.
          </p>
        </div>

        <div className="px-6">
          <form onSubmit={onSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <Label
                htmlFor="signup-name"
                className="text-sm font-medium text-card-foreground"
              >
                Nombre de usuario *
              </Label>
              <Input
                id="signup-name"
                type="text"
                required
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ken Adams"
                className={cn(inputDesign, "text-base")}
              />
              <p className="text-sm text-muted-foreground">
                Tu nombre, tu sobrenombre, tu <i>nom-de-plume</i>, tu personaje
                favorito de Star Wars... es tu decisión.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Label
                htmlFor="signup-email"
                className="text-sm font-medium text-card-foreground"
              >
                Email *
              </Label>
              <Input
                id="signup-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="kenadams@ejemplo.com"
                className={cn(inputDesign, "text-base")}
              />
              <p className="text-sm text-muted-foreground">
                Vamos a usar este email para contactarnos contigo e identificarte
                dentro de nuestro sistema. No tenés porqué incluirlo o compartirlo
                con nadie más que entre a encontrate.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Label
                htmlFor="signup-whatsapp"
                className="text-sm font-medium text-card-foreground"
              >
                Número asociado a WhatsApp *
              </Label>
              <Input
                id="signup-whatsapp"
                type="tel"
                required
                autoComplete="tel"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="+34600111222"
                className={cn(inputDesign, "text-base")}
              />
              <p className="text-sm text-muted-foreground">
                Usá formato internacional (E.164), por ejemplo: +34600111222.
                {whatsappNumber.trim() ? (
                  phoneState.ok ? (
                    <>
                      {" "}
                      <span className="text-card-foreground">
                        Formato OK.
                      </span>{" "}
                      {phoneState.waLink ? (
                        <a
                          href={phoneState.waLink}
                          target="_blank"
                          rel="noreferrer"
                          className="underline underline-offset-2"
                        >
                          Abrir en WhatsApp
                        </a>
                      ) : null}
                    </>
                  ) : (
                    <>
                      {" "}
                      <span className="text-destructive">
                        Número inválido.
                      </span>
                    </>
                  )
                ) : null}
              </p>
            </div>

            {error ? (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            ) : null}

            <Button
              type="submit"
              size="sm"
              className="w-full rounded-full font-medium shadow-xs disabled:opacity-100 disabled:bg-muted disabled:text-muted-foreground"
              disabled={loading || !formOk}
            >
              {loading ? "Creando…" : "Crear cuenta"}
            </Button>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="w-full rounded-full font-medium shadow-xs"
              disabled={loading || !formOk}
              onClick={onGoogle}
            >
              Continuar con Google
            </Button>
          </form>

          <p className="pt-4 text-center text-sm text-muted-foreground">
            Ya tenés cuenta?{" "}
            <Link
              href="/login"
              className="text-card-foreground underline decoration-solid underline-offset-2 [text-decoration-skip-ink:none] hover:text-card-foreground/90"
            >
              Iniciá sesión
            </Link>
          </p>

          <div className="pt-8">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="w-full rounded-full shadow-xs"
            >
              <Link href="/">Volver al inicio</Link>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

