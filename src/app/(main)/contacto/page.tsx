import Link from "next/link";
import { Mail, MessageCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function normalizeWhatsappNumber(raw: string) {
  return raw.replace(/[^\d]/g, "");
}

export default function ContactoPage() {
  const email =
    process.env.NEXT_PUBLIC_CONTACT_EMAIL ||
    process.env.ADMIN_EMAILS?.split(",")[0]?.trim() ||
    "contacto@encontrate.es";

  const whatsappRaw = process.env.NEXT_PUBLIC_CONTACT_WHATSAPP ?? "";
  const whatsapp = normalizeWhatsappNumber(whatsappRaw);
  const whatsappHref = whatsapp ? `https://wa.me/${whatsapp}` : undefined;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12">
      <Card className="border border-border bg-card shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)]">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-semibold">Contacto</CardTitle>
          <p className="text-sm text-muted-foreground">
            Elegí cómo querés escribirme.
          </p>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Button asChild size="lg" variant="secondary" className="h-auto justify-start gap-3 rounded-xl py-5">
            <Link
              href={`mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(
                "Contacto — encontrate",
              )}`}
            >
              <Mail className="size-5" aria-hidden />
              <span className="text-left">
                <span className="block text-sm font-semibold">Email</span>
                <span className="block text-xs text-muted-foreground">{email}</span>
              </span>
            </Link>
          </Button>

          <Button
            asChild={Boolean(whatsappHref)}
            size="lg"
            variant="secondary"
            className="h-auto justify-start gap-3 rounded-xl py-5"
            disabled={!whatsappHref}
          >
            {whatsappHref ? (
              <Link href={whatsappHref} target="_blank" rel="noreferrer">
                <MessageCircle className="size-5" aria-hidden />
                <span className="text-left">
                  <span className="block text-sm font-semibold">WhatsApp</span>
                  <span className="block text-xs text-muted-foreground">
                    {whatsappRaw || "Abrir chat"}
                  </span>
                </span>
              </Link>
            ) : (
              <span className="flex items-center gap-3">
                <MessageCircle className="size-5" aria-hidden />
                <span className="text-left">
                  <span className="block text-sm font-semibold">WhatsApp</span>
                  <span className="block text-xs text-muted-foreground">
                    Configurar `NEXT_PUBLIC_CONTACT_WHATSAPP`
                  </span>
                </span>
              </span>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

