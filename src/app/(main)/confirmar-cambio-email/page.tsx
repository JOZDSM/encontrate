import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmEmailClient } from "./confirm-email-client";

export const metadata = {
  title: "Confirmar cambio de email",
};

export default async function ConfirmarCambioEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const trimmed = token?.trim();

  if (!trimmed) {
    return (
      <div className="mx-auto w-full max-w-lg px-4 py-10">
        <Card className="border border-border bg-card shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)]">
          <CardContent className="space-y-4 p-6 text-card-foreground">
            <h1 className="text-xl font-semibold">Link inválido</h1>
            <p className="text-sm text-muted-foreground">
              Falta el token de confirmación. Pedí un nuevo cambio de email desde
              configuración.
            </p>
            <Button asChild variant="outline" size="sm">
              <Link href="/mis-cosas/configuracion">Ir a mi cuenta</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-10">
      <Card className="border border-border bg-card shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)]">
        <CardContent className="space-y-4 p-6 text-card-foreground">
          <h1 className="text-xl font-semibold">Confirmar email</h1>
          <ConfirmEmailClient token={trimmed} />
        </CardContent>
      </Card>
    </div>
  );
}
