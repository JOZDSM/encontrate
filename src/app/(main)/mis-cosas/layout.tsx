import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { MisCosasShell } from "@/components/mis-cosas-shell";
import { isUserApproved } from "@/lib/approval";
import { isUserProfileComplete } from "@/lib/profile";

export default async function MisCosasLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (!isUserProfileComplete(session)) redirect("/onboarding");
  if (!isUserApproved(session)) redirect("/pending");

  return (
    <MisCosasShell isAdmin={Boolean(session.user.isAdmin)}>
      {children}
    </MisCosasShell>
  );
}
