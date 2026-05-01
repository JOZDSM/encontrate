import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/auth";
import { isUserApproved } from "@/lib/approval";
import { isUserProfileComplete } from "@/lib/profile";
import { ContactForm } from "@/components/contact-form";

export default async function ContactoPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (!isUserProfileComplete(session)) redirect("/onboarding");
  if (!isUserApproved(session)) redirect("/pending");

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12">
      <Card className="border border-border bg-card shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)]">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-semibold">Contacto</CardTitle>
          <p className="text-sm text-muted-foreground">
            Mandanos tu mensaje y te responderemos lo antes posible.
          </p>
        </CardHeader>
        <CardContent>
          <ContactForm />
        </CardContent>
      </Card>
    </div>
  );
}

