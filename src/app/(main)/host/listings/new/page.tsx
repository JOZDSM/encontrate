import { HostListingWizard } from "@/components/host-listing-wizard";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { isUserApproved } from "@/lib/approval";
import { isUserProfileComplete } from "@/lib/profile";

export default async function NewListingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (!isUserProfileComplete(session)) redirect("/onboarding");
  if (!isUserApproved(session)) redirect("/pending");

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <HostListingWizard />
    </div>
  );
}
