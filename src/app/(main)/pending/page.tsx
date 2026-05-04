import { auth } from "@/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function PendingApprovalPage() {
  const session = await auth();

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col items-center justify-center px-4 py-10">
      <Card className="w-full max-w-[704px] rounded-xl border border-border py-6 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)] ring-0">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Cuenta pendiente de aprobación
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            {session?.user?.email
              ? `Tu cuenta (${session.user.email}) fue creada con éxito, pero aún no fue aprobada por el administrador.`
              : "Tu cuenta fue creada con éxito, pero aún no fue aprobada por el administrador."}
          </p>
          <p>Te va a llegar un mensaje apenas podamos revisar tu cuenta.</p>
        </CardContent>
      </Card>
    </div>
  );
}

