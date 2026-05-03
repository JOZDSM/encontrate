import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Card } from "@/components/ui/card";
import { isUserApproved } from "@/lib/approval";
import { isUserProfileComplete } from "@/lib/profile";
import { OnboardingForm } from "@/app/(main)/onboarding/onboarding-form";

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  if (isUserProfileComplete(session)) {
    // If profile is complete, send them where they belong.
    redirect(isUserApproved(session) ? "/mis-cosas" : "/pending");
  }

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col items-center justify-start px-4 pt-12 pb-24 md:pt-12 md:pb-10">
      <div className="flex w-full flex-col items-center gap-6">
        <Card className="w-full max-w-[704px] gap-0 rounded-xl border border-border bg-card py-6 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)] ring-0">
          <div className="flex flex-col gap-6 px-6">
            <div className="space-y-2">
              <h1 className="text-base font-semibold tracking-normal text-card-foreground">
                Completá tu perfil
              </h1>
              <p className="text-sm leading-5 text-muted-foreground">
                Antes de poder usar encontrate, necesitamos tu nombre y tu número de WhatsApp.
              </p>
            </div>

            <OnboardingForm
              defaultName={session.user.name ?? ""}
              defaultWhatsappNumber={session.user.whatsappNumber ?? ""}
              afterUrl={isUserApproved(session) ? "/mis-cosas" : "/pending"}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}

