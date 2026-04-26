"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { upsertSignupProfileAction } from "@/app/actions/signup";

const inputDesign =
  "h-9 rounded-md border border-border bg-background shadow-[0px_1px_2px_0px_rgba(0,0,0,0.1)] placeholder:text-muted-foreground md:text-sm";

export function SignupForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await upsertSignupProfileAction({
        email,
        name,
        whatsappNumber,
      });
    } catch {
      setLoading(false);
      setError("No se pudo guardar tu info. Probá de nuevo.");
      return;
    }

    const res = await signIn("resend", {
      email,
      redirect: false,
      callbackUrl: "/listings",
    });

    setLoading(false);
    if (res?.error) {
      setError("No se pudo enviar el link. Revisá tu email y RESEND_API_KEY.");
      return;
    }
    window.location.href = "/login/verify";
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
                Nombre de usuario
              </Label>
              <Input
                id="signup-name"
                type="text"
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
                Email
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
                Número asociado a WhatsApp
              </Label>
              <Input
                id="signup-whatsapp"
                type="tel"
                autoComplete="tel"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="+34 674 234"
                className={cn(inputDesign, "text-base")}
              />
              <p className="text-sm text-muted-foreground">
                Vamos a usar este número de teléfono para contactarnos contigo.
                Tampoco tenés porqué incluirlo o compartirlo con nadie más que
                entre a encontrate.
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
              disabled={loading}
            >
              {loading ? "Creando…" : "Crear cuenta"}
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

