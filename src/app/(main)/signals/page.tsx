import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { isUserApproved } from "@/lib/approval";
import { isUserProfileComplete } from "@/lib/profile";
import { prisma } from "@/lib/db";
import { SignalWizard } from "@/components/signal-wizard";
import { serializeSignalForWizard } from "@/lib/signal-wizard-state";

/**
 * "Busco habitación" entry point. Goes straight into the Señal wizard.
 *
 * - Resumes the user's existing DRAFT (only one DRAFT per user is enforced
 *   by `Signal.@@index([userId, status])` + the find-first-and-reuse strategy
 *   below; we don't keep multiple drafts around).
 * - Creates a fresh DRAFT if none exists.
 *
 * Management of all Señales (drafts + active + inactive) lives at
 * `/mis-cosas/signals` (Section 5).
 */
export default async function SignalsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?next=/signals");
  if (!isUserProfileComplete(session)) redirect("/onboarding");
  if (!isUserApproved(session)) redirect("/pending");

  const userId = session.user.id;

  let draft = await prisma.signal.findFirst({
    where: { userId, status: "DRAFT" },
    include: { photos: { orderBy: { sortOrder: "asc" } } },
  });

  if (!draft) {
    draft = await prisma.signal.create({
      data: {
        userId,
        status: "DRAFT",
        wizardStep: 0,
        wizardFlowVersion: 2,
        fullName: session.user.name?.trim() ?? "",
      },
      include: { photos: { orderBy: { sortOrder: "asc" } } },
    });
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <SignalWizard
        signalId={draft.id}
        startStep={draft.wizardStep}
        initialState={serializeSignalForWizard(draft)}
      />
    </div>
  );
}
