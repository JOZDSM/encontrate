import { HostListingForm } from "@/components/host-listing-form";
import { Card, CardContent } from "@/components/ui/card";

export default function NewListingPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <Card className="border border-border bg-card shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)]">
        <CardContent className="space-y-6 p-6 text-card-foreground">
          <div>
            <h1 className="text-2xl font-semibold">Nuevo anuncio</h1>
            <p className="text-sm text-muted-foreground">
              El barrio es público; la dirección completa solo tras confirmar reserva.
            </p>
          </div>
          <HostListingForm />
        </CardContent>
      </Card>
    </div>
  );
}
