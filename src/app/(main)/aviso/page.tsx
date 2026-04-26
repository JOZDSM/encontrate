import { Card, CardContent } from "@/components/ui/card";

export default function AvisoPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12">
      <Card className="border border-border bg-card shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)]">
        <CardContent className="space-y-6 p-6 text-sm leading-relaxed text-card-foreground">
          <h1 className="text-2xl font-semibold">Aviso legal (plantilla)</h1>
          <p>
            <strong>Encontrate</strong> es un servicio de intermediación informativa.
            No somos arrendadores ni agentes inmobiliarios. No gestionamos pagos,
            fianzas ni impuestos turísticos en la plataforma.
          </p>
          <p>
            Las condiciones del alquiler (precio, entrada, salida, normas de la casa)
            las acordáis anfitrión y huésped fuera de este sitio o por los canales
            que elijáis.
          </p>
          <p>
            El responsable del tratamiento puede acceder a anuncios, reservas y
            mensajes con fines de seguridad, soporte y cumplimiento. Sustituye este
            texto por uno revisado por un profesional si lo publicas.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
