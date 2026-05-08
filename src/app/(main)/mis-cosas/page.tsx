"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { MisCosasMobileHub } from "@/components/mis-cosas-mobile-hub";
import { useIsMobile } from "@/hooks/use-mobile";

export default function MisCosasIndexPage() {
  const router = useRouter();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isMobile === false) {
      router.replace("/mis-cosas/mensajes");
    }
  }, [isMobile, router]);

  if (isMobile === false) return null;
  return <MisCosasMobileHub />;
}
