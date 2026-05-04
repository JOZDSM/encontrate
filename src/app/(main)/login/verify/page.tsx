import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function VerifyRequestPage() {
  return (
    <div className="flex min-h-0 w-full flex-1 flex-col items-center justify-center px-4 py-8 md:py-10">
      <Card className="w-full max-w-[704px] rounded-xl border border-border py-6 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)] ring-0">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Revisá tu email</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>
            Te enviamos un enlace para entrar a tu cuenta. Puede tardar un minuto. También revisá tu spam!
          </p>
          <Link href="/login" className="text-card-foreground underline underline-offset-4">
            Pedir un nuevo link
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
