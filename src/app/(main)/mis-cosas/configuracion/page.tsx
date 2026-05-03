import { Card, CardContent } from "@/components/ui/card";

export const metadata = {
  title: "Configuración",
};

export default function MisCosasConfiguracionPage() {
  return (
    <Card className="border border-border bg-card shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)]">
      <CardContent className="space-y-2 p-6 text-card-foreground">
        <h1 className="text-2xl font-semibold">Configuración</h1>
        <p className="text-sm text-muted-foreground">
          Próximamente vas a poder editar tu perfil y preferencias desde acá.
        </p>
      </CardContent>
    </Card>
  );
}
