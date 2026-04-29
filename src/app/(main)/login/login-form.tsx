"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const inputDesign =
  "h-9 rounded-md border border-border bg-background shadow-[0px_1px_2px_0px_rgba(0,0,0,0.1)] placeholder:text-muted-foreground md:text-sm";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
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
            Iniciá sesión con tu email
          </h1>
          <p className="text-sm leading-5 text-muted-foreground">
            Podés iniciar sesión recibiendo un link en tu email, o, más rápido,
            continuando con Google.
          </p>
        </div>

        <div className="px-6">
          <form onSubmit={onSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <Label
                htmlFor="login-email"
                className="text-sm font-medium text-card-foreground"
              >
                Email
              </Label>
              <Input
                id="login-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="kenadams@gmail.com"
                className={cn(inputDesign, "text-base")}
              />
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
              {loading ? "Enviando…" : "Enviar link"}
            </Button>
          </form>

          <div className="pt-3">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="w-full rounded-full font-medium shadow-xs"
              onClick={() => signIn("google", { callbackUrl: "/listings" })}
            >
              Continuar con Google
            </Button>
          </div>

          <p className="pt-4 text-center text-sm text-muted-foreground">
            ¿Primera vez?{" "}
            <Link
              href="/signup"
              className="text-card-foreground underline decoration-solid underline-offset-2 [text-decoration-skip-ink:none] hover:text-card-foreground/90"
            >
              Creá tu cuenta
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
