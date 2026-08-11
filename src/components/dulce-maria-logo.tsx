import * as React from "react";
import { cn } from "@/lib/utils";

/** Design display width — SVG scales crisply at any DPR. */
const LOGO_MAX_WIDTH_PX = 589.22;

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
      className={cn("h-auto w-full object-contain", className)}
      style={{
        maxWidth: LOGO_MAX_WIDTH_PX,
        aspectRatio: "590 / 146",
        ...style,
      }}
      {...props}
    />
  );
}
