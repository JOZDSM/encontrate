import * as React from "react";
import { cn } from "@/lib/utils";

/** Design display width — SVG scales crisply at any DPR. */
const LOGO_DISPLAY_WIDTH_PX = 589.22;
const LOGO_ASPECT = 146 / 590;

/** Dulce María wordmark from vector export. */
export function DulceMariaLogo({
  className,
  style,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement>) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/design/home-services/dulce-maria-logo.svg"
      alt="Dulce María"
      width={590}
      height={146}
      decoding="async"
      className={cn("h-auto max-w-none object-contain", className)}
      style={{
        width: LOGO_DISPLAY_WIDTH_PX,
        height: LOGO_DISPLAY_WIDTH_PX * LOGO_ASPECT,
        ...style,
      }}
      {...props}
    />
  );
}
