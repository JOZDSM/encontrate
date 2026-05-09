import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { isUserApproved } from "@/lib/approval";
import { isUserProfileComplete } from "@/lib/profile";
import { prisma } from "@/lib/db";
import { isPlatformAdmin } from "@/lib/admin";
import { SignalWizard } from "@/components/signal-wizard";
import { serializeSignalForWizard } from "@/lib/signal-wizard-state";

/**
 * Owner-gated edit for a Señal. Re-renders the wizard at the saved
 * `wizardStep` so the user can keep refining a draft, or jump back into
 * an active Señal to revise.
 */
export default async function EditSignalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (!isUserProfileComplete(session)) redirect("/onboarding");
  if (!isUserApproved(session)) redirect("/pending");

  const signal = await prisma.signal.findUnique({
    where: { id },
    include: { photos: { orderBy: { sortOrder: "asc" } } },
  });
  if (!signal) notFound();
  if (signal.userId !== session.user.id && !isPlatformAdmin(session)) notFound();

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <SignalWizard
        signalId={signal.id}
        startStep={signal.wizardStep}
        initialState={serializeSignalForWizard(signal)}
      />
    </div>
  );
}
