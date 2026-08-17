"use client";

import Link from "next/link";
import { useState } from "react";
import { useServiceShare } from "@/hooks/use-service-share";
import { cn } from "@/lib/utils";

const mobileIconButtonClass =
  "inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white text-black shadow-none transition-opacity hover:opacity-90";

function MobileBackIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M12.5 16.25L6.25 10L12.5 3.75"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MobileShareIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M10 3.75V12.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M6.875 6.875L10 3.75L13.125 6.875"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.375 11.875V14.375C4.375 15.203 5.047 15.875 5.875 15.875H14.125C14.953 15.875 15.625 15.203 15.625 14.375V11.875"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ServiceHeroMobileBackButton({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="Volver"
      className={cn(mobileIconButtonClass, className)}
    >
      <MobileBackIcon />
    </Link>
  );
}

export function ServiceHeroMobileShareButton({
  title,
  text,
  serviceId,
  slug,
  serviceTitle,
  professionalName,
  className,
}: {
  title: string;
  text: string;
  serviceId: string;
  slug: string;
  serviceTitle: string;
  professionalName: string;
  className?: string;
}) {
  const { share } = useServiceShare({
    title,
    text,
    serviceId,
    slug,
    serviceTitle,
    professionalName,
  });

  return (
    <button
      type="button"
      aria-label="Compartir"
      className={cn(mobileIconButtonClass, className)}
      onClick={() => void share()}
    >
      <MobileShareIcon />
    </button>
  );
}

/** Hero background with mobile URL and fallback to desktop on load error. */
export function ServiceHeroBackground({
  desktopUrl,
  mobileUrl,
}: {
  desktopUrl: string;
  mobileUrl: string;
}) {
  const [mobileSrc, setMobileSrc] = useState(mobileUrl);

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={desktopUrl}
        alt=""
        className="absolute inset-0 hidden size-full object-cover object-[60%_top] md:block"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={mobileSrc}
        alt=""
        className="absolute inset-0 size-full object-cover object-center md:hidden"
        onError={() => {
          if (mobileSrc !== desktopUrl) setMobileSrc(desktopUrl);
        }}
      />
    </>
  );
}
