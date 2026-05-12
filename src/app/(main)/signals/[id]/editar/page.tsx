import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { isUserApproved } from "@/lib/approval";
import { isUserProfileComplete } from "@/lib/profile";
import { prisma } from "@/lib/db";
import { isPlatformAdmin } from "@/lib/admin";
import { SignalWizard } from "@/components/signal-wizard";
import { serializeSignalForWizard } from "@/lib/signal-wizard-state";

/**
 * Owner-gated edit for a Señal. Always starts the wizard at step 1 so the
 * user can review every field on the way to the final step — `/signals`
 * (DRAFT entry) still resumes at the saved `wizardStep`.
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
        startStep={0}
        initialState={serializeSignalForWizard(signal)}
      />
    </div>
  );
}
