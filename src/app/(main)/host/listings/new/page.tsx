import { HostListingForm } from "@/components/host-listing-form";

export default function NewListingPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-10">
      <div>
        <h1 className="text-2xl font-semibold">Nuevo anuncio</h1>
        <p className="text-sm text-muted-foreground">
          El barrio es público; la dirección completa solo tras confirmar reserva.
        </p>
      </div>
      <HostListingForm />
    </div>
  );
}
