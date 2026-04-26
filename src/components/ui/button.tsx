"use client"

import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-4xl border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/80",
        outline:
          "border-border bg-input/30 hover:bg-input/50 hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost:
          "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        // Below sm: large touch targets; sm–md: compact; md+ desktop: one step up from sm tier.
        default:
          "h-11 gap-2 px-5 text-base has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3 sm:h-9 sm:gap-1.5 sm:px-3 sm:text-sm sm:has-data-[icon=inline-end]:pr-2.5 sm:has-data-[icon=inline-start]:pl-2.5 md:h-10 md:gap-2 md:px-4 md:has-data-[icon=inline-end]:pr-3 md:has-data-[icon=inline-start]:pl-3",
        xs: "h-9 gap-1.5 px-4 text-sm has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5 sm:h-6 sm:gap-1 sm:px-2.5 sm:text-xs sm:has-data-[icon=inline-end]:pr-2 sm:has-data-[icon=inline-start]:pl-2 md:h-7 md:gap-1.5 md:px-3 md:has-data-[icon=inline-end]:pr-2.5 md:has-data-[icon=inline-start]:pl-2.5 [&_svg:not([class*='size-'])]:size-4 sm:[&_svg:not([class*='size-'])]:size-3 md:[&_svg:not([class*='size-'])]:size-3.5",
        sm: "h-11 gap-2 px-4 text-base has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3 sm:h-8 sm:gap-1 sm:px-3 sm:text-sm sm:has-data-[icon=inline-end]:pr-2 sm:has-data-[icon=inline-start]:pl-2 md:h-9 md:gap-1.5 md:px-4 md:has-data-[icon=inline-end]:pr-2.5 md:has-data-[icon=inline-start]:pl-2.5",
        lg: "min-h-12 h-12 gap-2 px-6 text-lg has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4 sm:h-10 sm:min-h-0 sm:gap-1.5 sm:px-4 sm:text-sm sm:has-data-[icon=inline-end]:pr-3 sm:has-data-[icon=inline-start]:pl-3 md:h-11 md:min-h-11 md:gap-2 md:px-5 md:text-base md:has-data-[icon=inline-end]:pr-4 md:has-data-[icon=inline-start]:pl-4",
        icon: "size-11 sm:size-9 md:size-10",
        "icon-xs": "size-9 [&_svg:not([class*='size-'])]:size-4 sm:size-6 sm:[&_svg:not([class*='size-'])]:size-3 md:size-7 md:[&_svg:not([class*='size-'])]:size-3.5",
        "icon-sm": "size-10 sm:size-8 md:size-9",
        "icon-lg": "size-12 sm:size-10 md:size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

type ButtonProps = ButtonPrimitive.Props &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: ButtonProps) {
  const classes = cn(buttonVariants({ variant, size, className }))
  if (asChild) {
    return (
      <Slot data-slot="button" className={classes} {...props} />
    )
  }
  return (
    <ButtonPrimitive data-slot="button" className={classes} {...props} />
  )
}

export { Button, buttonVariants }
