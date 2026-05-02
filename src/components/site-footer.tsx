import Link from "next/link";
import { cn } from "@/lib/utils";

export function SiteFooter() {
  return (
    <footer
      className={cn(
        "flex shrink-0 flex-col items-center justify-center gap-1 border-t border-border px-4 py-6 text-center text-sm text-primary-foreground/80 dark:text-foreground",
        "transition-[border-color] duration-300 ease-out",
        "md:border-transparent md:hover:border-border md:focus-within:border-border",
      )}
    >
      <p className="px-4 leading-snug">
        Encontrate solamente genera encuentros entre personas.{" "}
        <Link
          href="/aviso"
          className="underline underline-offset-2 hover:text-primary-foreground dark:text-foreground"
        >
          Aviso legal
        </Link>
      </p>
    </footer>
  );
}
