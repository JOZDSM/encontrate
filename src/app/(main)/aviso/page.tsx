import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Aviso legal",
  description:
    "Aviso legal de encontrate.es: intermediación informativa para estancias y catálogo curado de servicios de terceros.",
};

export default function AvisoPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12">
      <Card className="border border-border bg-card shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)]">
        <CardContent className="space-y-8 p-6 text-sm leading-relaxed text-card-foreground md:p-8">
          <header className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">Aviso legal</h1>
            <p className="text-muted-foreground">
              Última actualización: 16 de julio de 2026
            </p>
          </header>

          <section className="space-y-3">
            <h2 className="text-base font-semibold">1. Datos identificativos</h2>
            <p>
              En cumplimiento de la Ley 34/2002, de 11 de julio, de Servicios de la
              Sociedad de la Información y de Comercio Electrónico (LSSI-CE), y
              demás normativa aplicable, se informa de que el sitio web{" "}
              <strong>encontrate.es</strong> (en adelante, el «Sitio») es explotado
              por:
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                <strong>Titular:</strong> [NOMBRE Y APELLIDOS o RAZÓN SOCIAL]
              </li>
              <li>
                <strong>NIF / CIF:</strong> [NIF o CIF]
              </li>
              <li>
                <strong>Domicilio:</strong> [dirección completa, código postal,
                localidad, provincia, España]
              </li>
              <li>
                <strong>Correo de contacto:</strong>{" "}
                <a
                  href="mailto:hola@encontrate.es"
                  className="underline underline-offset-2"
                >
                  hola@encontrate.es
                </a>{" "}
                (o el correo que indiques en el formulario de Contacto del Sitio)
              </li>
              <li>
                <strong>Sitio web:</strong>{" "}
                <a
                  href="https://encontrate.es"
                  className="underline underline-offset-2"
                >
                  https://encontrate.es
                </a>
              </li>
            </ul>
            <p>
              Si el titular actúa como empresario o profesional autónomo, o como
              sociedad mercantil, deberá completar los datos anteriores de forma
              exacta. En su caso, también se indicará el número de inscripción en
              el Registro Mercantil u otro registro público que corresponda.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold">2. Objeto del Sitio</h2>
            <p>
              Encontrate es una plataforma digital que ofrece, de forma
              diferenciada, dos líneas de actividad:
            </p>
            <ol className="list-decimal space-y-3 pl-5">
              <li>
                <strong>Coordinación de estancias / habitaciones.</strong> El
                Sitio facilita la publicación de anuncios, la comunicación entre
                personas interesadas (anfitriones y huéspedes), la gestión del
                estado de solicitudes o reservas a efectos informativos, y
                herramientas relacionadas (por ejemplo, mensajes o señales de
                búsqueda).{" "}
                <strong>
                  Encontrate no es arrendador, no es agencia inmobiliaria y no
                  actúa como parte del contrato de alquiler o cesión de uso.
                </strong>{" "}
                El acuerdo sobre precio, fechas, normas de la casa, fianzas,
                impuestos, llaves y demás condiciones se celebra exclusivamente
                entre las partes usuarias, fuera o al margen de cualquier
                intermediación contractual de Encontrate.
              </li>
              <li>
                <strong>Catálogo curado de servicios y ofertas de terceros.</strong>{" "}
                El Sitio puede mostrar una selección editorial de servicios,
                negocios u ofertas prestados por profesionales o empresas
                independientes (en adelante, «Prestadores»). La inclusión en
                dicha selección puede estar sujeta a contraprestación económica a
                favor del titular del Sitio.{" "}
                <strong>
                  Encontrate no presta por sí mismo esos servicios de terceros
                </strong>{" "}
                y no sustituye la relación contractual entre el usuario final y el
                Prestador.
              </li>
            </ol>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold">
              3. Naturaleza del servicio de estancias
            </h2>
            <p>Respecto a la línea de habitaciones y estancias:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                Encontrate presta un <strong>servicio de intermediación
                informativa y de comunicación</strong> entre usuarios. No
                garantiza la disponibilidad, legalidad urbanística o turística,
                habitabilidad, veracidad de las fotos, ni el resultado de
                cualquier estancia.
              </li>
              <li>
                <strong>No se gestionan en la plataforma</strong> pagos de
                alquiler, fianzas, comisiones de estancia, impuestos turísticos ni
                seguros. Cualquier pago se realiza, en su caso, directamente entre
                las partes por los medios que ellas elijan.
              </li>
              <li>
                Las opiniones, perfiles, anuncios y mensajes son responsabilidad
                de quien los publica. El titular puede moderar, suspender o
                eliminar contenidos o cuentas por seguridad, abuso, fraude o
                incumplimiento de las normas de uso.
              </li>
              <li>
                El acceso a determinadas funciones puede requerir registro,
                verificación de identidad o aprobación previa a criterio del
                titular, sin que ello implique aval de la solvencia o conducta de
                los usuarios.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold">
              4. Catálogo curado de servicios de terceros
            </h2>
            <p>Respecto a la selección de servicios y ofertas de terceros:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                Los Prestadores son <strong>terceros independientes</strong>. Su
                presencia en el Sitio no convierte a Encontrate en empleador,
                socio, franquiciador ni representante del Prestador, salvo que se
                indique expresamente por escrito.
              </li>
              <li>
                La <strong>curación</strong> implica una selección y
                presentación editorial. No constituye garantía de calidad,
                precio, disponibilidad, titulaciones, seguros, permisos o
                resultado del servicio. El usuario debe verificar por sí mismo la
                idoneidad del Prestador antes de contratar.
              </li>
              <li>
                La participación de un Prestador en la selección puede estar
                sujeta a <strong>pago u otras condiciones comerciales</strong>{" "}
                acordadas con el titular del Sitio. Esa relación comercial con el
                Prestador es independiente de cualquier contrato que el usuario
                celebre con el Prestador.
              </li>
              <li>
                Los datos de contacto, horarios, enlaces a sitios web o redes
                sociales, precios orientativos y demás información sobre un
                Prestador se ofrecen a título informativo. Encontrate no se
                responsabiliza de errores, omisiones o cambios no actualizados,
                sin perjuicio de corregirlos cuando tenga conocimiento razonable
                de ellos.
              </li>
              <li>
                Cualquier reclamación relativa al servicio prestado por un
                tercero deberá dirigirse, en primer término, al Prestador
                correspondiente.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold">5. Condiciones de uso</h2>
            <p>
              El acceso y uso del Sitio atribuyen la condición de usuario e
              implican la aceptación de este aviso legal. El usuario se
              compromete a:
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                Utilizar el Sitio de forma lícita, de buena fe y conforme a la
                ley, la moral y el orden público.
              </li>
              <li>
                No publicar contenidos ilícitos, engañosos, discriminatorios,
                que vulneren derechos de terceros o que faciliten actividades
                ilegales (incluida la oferta de alojamientos sin los permisos
                exigibles cuando correspondan).
              </li>
              <li>
                Facilitar datos veraces en el registro y mantener la
                confidencialidad de sus credenciales de acceso.
              </li>
              <li>
                No realizar scraping masivo, ataques, ingeniería inversa abusiva
                ni usos que degraden la disponibilidad del servicio.
              </li>
            </ul>
            <p>
              El titular podrá denegar o retirar el acceso sin previo aviso ante
              incumplimientos graves o reiterados.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold">
              6. Exclusión y limitación de responsabilidad
            </h2>
            <p>En la medida permitida por la ley aplicable:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                Encontrate no responde de los daños derivados de la relación
                entre anfitrión y huésped, ni entre usuario y Prestador
                (incluidos incumplimientos contractuales, daños en el
                inmueble, lesiones, pérdidas económicas o disputas sobre
                depósitos).
              </li>
              <li>
                No se garantiza la ausencia ininterrumpida de errores técnicos,
                caídas del servicio o vulnerabilidades; se procurará un nivel
                razonable de diligencia en la operación del Sitio.
              </li>
              <li>
                Encontrate no controla ni asume responsabilidad por sitios web
                de terceros enlazados desde el Sitio (incluido Instagram u otras
                redes de Prestadores).
              </li>
              <li>
                Nada en este aviso limita derechos imperativos de consumidores y
                usuarios cuando resulten de aplicación.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold">7. Propiedad intelectual</h2>
            <p>
              Los elementos del Sitio (marca «encontrate», logotipos, diseño,
              tipografías propias, código y textos elaborados por el titular),
              salvo indicación en contrario, son titularidad del operador del
              Sitio o se utilizan con licencia. Queda prohibida su reproducción,
              distribución o comunicación pública no autorizada.
            </p>
            <p>
              Los usuarios y Prestadores conservan los derechos sobre los
              contenidos que aportan (fotos, textos, marcas propias), y
              conceden al titular una licencia no exclusiva, mundial y gratuita
              para alojarlos, mostrarlos y adaptarlos técnicamente en el Sitio
              mientras permanezcan publicados o sea necesario para la operación
              del servicio y el cumplimiento legal.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold">
              8. Protección de datos personales
            </h2>
            <p>
              El tratamiento de datos personales se realiza conforme al
              Reglamento (UE) 2016/679 (RGPD) y a la Ley Orgánica 3/2018
              (LOPDGDD). Con carácter general:
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong>Responsable:</strong> el titular indicado en el
                apartado 1.
              </li>
              <li>
                <strong>Finalidades:</strong> prestar el servicio (cuenta,
                anuncios, mensajes, reservas informativas, catálogo), seguridad,
                prevención de fraude, atención al usuario y, en su caso,
                comunicaciones relacionadas con el servicio. El marketing
                directo solo se realizará con base jurídica adecuada
                (consentimiento o interés legítimo, según corresponda).
              </li>
              <li>
                <strong>Destinatarios:</strong> proveedores tecnológicos
                necesarios para operar el Sitio (alojamiento, correo, analítica)
                bajo encargo de tratamiento cuando proceda; y otros usuarios
                únicamente en la medida necesaria para la comunicación entre
                partes (por ejemplo, datos de contacto que el propio usuario
                decida compartir).
              </li>
              <li>
                <strong>Derechos:</strong> acceso, rectificación, supresión,
                oposición, limitación y portabilidad, cuando procedan, dirigiéndose
                al correo de contacto del apartado 1. También puede reclamarse
                ante la Agencia Española de Protección de Datos (
                <a
                  href="https://www.aepd.es"
                  className="underline underline-offset-2"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  www.aepd.es
                </a>
                ).
              </li>
            </ul>
            <p>
              Si se publica una política de privacidad o de cookies específica,
              esta prevalecerá en lo que regule de forma más detallada.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold">9. Cookies</h2>
            <p>
              El Sitio puede utilizar cookies técnicas necesarias para el
              funcionamiento (por ejemplo, sesión) y, en su caso, cookies
              analíticas o de terceros. Cuando la normativa lo exija, se
              solicitará el consentimiento previo para cookies no esenciales y
              se informará de forma específica en el banner o política de
              cookies correspondiente.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold">
              10. Modificaciones
            </h2>
            <p>
              El titular podrá modificar este aviso legal para adaptarlo a
              cambios legales, técnicos o de modelo de negocio. La versión
              vigente será la publicada en esta página, con indicación de la
              fecha de actualización. El uso continuado del Sitio tras la
              publicación implica la aceptación de la versión actualizada, en la
              medida permitida por la ley.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold">
              11. Legislación aplicable y jurisdicción
            </h2>
            <p>
              Este aviso legal se rige por la legislación española. Para
              cualquier controversia derivada del uso del Sitio, las partes se
              someten a los juzgados y tribunales del domicilio del titular o,
              cuando el usuario tenga la condición de consumidor, a los
              tribunales que correspondan conforme a la normativa de protección
              de consumidores y usuarios.
            </p>
          </section>

          <section className="space-y-3 border-t border-border pt-6">
            <h2 className="text-base font-semibold">Contacto</h2>
            <p>
              Para consultas relativas a este aviso legal o al Sitio, puedes
              utilizar el formulario de{" "}
              <a href="/contacto" className="underline underline-offset-2">
                Contacto
              </a>{" "}
              o escribir a{" "}
              <a
                href="mailto:hola@encontrate.es"
                className="underline underline-offset-2"
              >
                hola@encontrate.es
              </a>
              .
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
