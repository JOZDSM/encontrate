import * as React from "react";
import { cn } from "@/lib/utils";

/** PiPOL wordmark from design export (white on transparent-friendly crop). */
export function PipolLogo({
  className,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement>) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/design/home-services/pipol-logo.png"
      alt="PiPOL"
      className={cn(
        "h-auto w-[min(100%,18rem)] max-w-xs object-contain mix-blend-lighten sm:max-w-sm",
        className,
      )}
      {...props}
    />
  );
}
