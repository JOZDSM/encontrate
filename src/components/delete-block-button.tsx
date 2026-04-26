"use client";

import { useRouter } from "next/navigation";
import { deleteAvailabilityBlock } from "@/app/actions/blocks";
import { Button } from "@/components/ui/button";

export function DeleteBlockButton({ blockId }: { blockId: string }) {
  const router = useRouter();
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="text-destructive"
      onClick={async () => {
        await deleteAvailabilityBlock(blockId);
        router.refresh();
      }}
    >
      Quitar
    </Button>
  );
}
