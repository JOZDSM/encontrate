"use client";

import { Globe, Instagram, Mail, MessageCircle, MessageSquare } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  captureServiceContactOpened,
  captureServiceContactOptionClicked,
  type ServiceContactSurface,
} from "@/lib/service-contact-analytics";
import { cn } from "@/lib/utils";

function whatsappHref(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  return `https://wa.me/${digits}`;
}

export function ServiceContactDialog({
  serviceId,
  slug,
  surface,
  whatsapp,
  email,
  showWhatsapp,
  showEmail,
  websiteUrl,
  instagramUrl,
  instagramHandle,
  triggerClassName,
  triggerLabel = "Contactar",
  triggerIcon = true,
}: {
  serviceId: string;
  slug: string;
  surface: ServiceContactSurface;
  whatsapp: string | null;
  email: string | null;
  showWhatsapp: boolean;
  showEmail: boolean;
  websiteUrl: string | null;
  instagramUrl: string | null;
  instagramHandle: string | null;
  triggerClassName?: string;
  triggerLabel?: string;
  triggerIcon?: boolean;
}) {
  const [open, setOpen] = useState(false);

  const options = [
    showWhatsapp && whatsapp
      ? {
          key: "whatsapp" as const,
          label: "WhatsApp",
          href: whatsappHref(whatsapp),
          icon: MessageCircle,
        }
      : null,
    showEmail && email
      ? {
          key: "email" as const,
          label: "Email",
          href: `mailto:${email}`,
          icon: Mail,
        }
      : null,
    instagramUrl
      ? {
          key: "instagram" as const,
          label: instagramHandle || "Instagram",
          href: instagramUrl,
          icon: Instagram,
        }
      : null,
    websiteUrl
      ? {
          key: "website" as const,
          label: "Sitio web",
          href: websiteUrl,
          icon: Globe,
        }
      : null,
  ].filter(Boolean) as Array<{
    key: "whatsapp" | "email" | "instagram" | "website";
    label: string;
    href: string;
    icon: typeof Mail;
  }>;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) captureServiceContactOpened(serviceId, slug, surface);
      }}
    >
      <DialogTrigger
        render={
          <button
            type="button"
            className={cn(
              "inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-full text-sm font-medium",
              triggerClassName,
            )}
          >
            {triggerIcon ? (
              <MessageSquare className="size-4" strokeWidth={2} aria-hidden />
            ) : null}
            {triggerLabel}
          </button>
        }
      />
      <DialogContent className="gap-4 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Contactar</DialogTitle>
          <DialogDescription>
            Elegí cómo querés comunicarte.
          </DialogDescription>
        </DialogHeader>

        {options.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Este servicio todavía no tiene opciones de contacto públicas.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {options.map((option) => {
              const Icon = option.icon;
              return (
                <Button
                  key={option.key}
                  asChild
                  variant="secondary"
                  className="justify-start rounded-full"
                >
                  <a
                    href={option.href}
                    target={option.key === "email" ? undefined : "_blank"}
                    rel={
                      option.key === "email" ? undefined : "noopener noreferrer"
                    }
                    onClick={() =>
                      captureServiceContactOptionClicked(
                        serviceId,
                        slug,
                        option.key,
                        surface,
                      )
                    }
                  >
                    <Icon className="size-4" aria-hidden />
                    {option.label}
                  </a>
                </Button>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
