"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Bold, Italic, List } from "lucide-react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const TOTAL_STEPS = 6;

export function HostListingWizard() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);

  // Step 1: listing title only for now.
  const [title, setTitle] = useState("");
  const [descriptionHtml, setDescriptionHtml] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        blockquote: false,
        orderedList: false,
      }),
      Placeholder.configure({
        placeholder:
          "Ej. Si estás buscando una habitación grande, con baño privado, amueblada, con cama doble…",
      }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class:
          "max-w-none focus:outline-none text-sm leading-5 text-foreground [&_p]:m-0 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-6 [&_li]:my-1",
      },
    },
    onUpdate: ({ editor }) => {
      setDescriptionHtml(editor.getHTML());
    },
  });

  const canGoNext = useMemo(() => {
    if (stepIndex === 0) return title.trim().length > 0;
    if (stepIndex === 1) return editor ? editor.getText().trim().length > 0 : false;
    return true;
  }, [stepIndex, title, editor]);
  const progressValue = Math.min(1, Math.max(0, (stepIndex + 1) / TOTAL_STEPS));

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-1 items-center justify-center px-4 py-10">
      <Card className="flex w-full max-w-[1220px] flex-col border border-border bg-card shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)]">
        <CardContent className="flex min-h-[560px] flex-1 flex-col p-6 text-card-foreground">
          <div className="mx-auto flex w-full max-w-[730px] flex-1 flex-col justify-center">
            {stepIndex === 0 ? (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h1 className="text-[36px] leading-[40px] font-extrabold">
                    Dale un nombre a tu habitación
                  </h1>
                  <p className="text-sm leading-5 text-muted-foreground">
                    Los títulos cortos que resaltan dónde está el piso (y qué lo
                    destaca) funcionan mejor.
                  </p>
                </div>

                <div className="w-full">
                  <Textarea
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    rows={2}
                    className="min-h-20"
                    placeholder="Ej. Habitación doble con balcón a 3 minutos de la Sagrada Familia."
                    aria-label="Título del anuncio"
                  />
                </div>
              </div>
            ) : stepIndex === 1 ? (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h1 className="text-[36px] leading-[40px] font-extrabold">
                    Dale una descripción a tu habitación
                  </h1>
                  <p className="text-sm leading-5 text-muted-foreground">
                    Incluí toda la información necesaria, especialmente precios — si querés
                    contarlos por acá — ya que por ahora no habilitamos un filtro por precio
                    como lo hacemos con otras características en los pasos siguientes.
                    <br />
                    (Siempre podés volver a este paso a editar tu descripción)
                  </p>
                </div>

                <div className="w-full space-y-3">
                  <div className="flex items-center justify-between rounded-xl border border-input bg-input/30 px-3 py-2">
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        className={cn(
                          "rounded-lg",
                          editor?.isActive("bold") ? "bg-muted" : "",
                        )}
                        onClick={() => editor?.chain().focus().toggleBold().run()}
                        aria-label="Negrita"
                      >
                        <Bold className="size-4" aria-hidden />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        className={cn(
                          "rounded-lg",
                          editor?.isActive("italic") ? "bg-muted" : "",
                        )}
                        onClick={() => editor?.chain().focus().toggleItalic().run()}
                        aria-label="Cursiva"
                      >
                        <Italic className="size-4" aria-hidden />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        className={cn(
                          "rounded-lg",
                          editor?.isActive("bulletList") ? "bg-muted" : "",
                        )}
                        onClick={() => editor?.chain().focus().toggleBulletList().run()}
                        aria-label="Lista con viñetas"
                      >
                        <List className="size-4" aria-hidden />
                      </Button>
                    </div>
                  </div>

                  <div className="min-h-[140px] w-full rounded-xl border border-input bg-input/30 px-3 py-3">
                    <EditorContent editor={editor} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground text-sm">
                Paso {stepIndex + 1} de {TOTAL_STEPS} (pendiente de diseño).
              </div>
            )}
          </div>

          <div className="mt-auto h-[92px] border-t border-border pt-4">
            <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-foreground transition-[width] duration-300 ease-out"
                style={{ width: `${Math.round(progressValue * 100)}%` }}
              />
            </div>

            <div className="mt-4 flex items-center justify-between">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className={cn("rounded-full")}
                onClick={() => {
                  if (stepIndex === 0) router.back();
                  else setStepIndex((s) => Math.max(0, s - 1));
                }}
              >
                Atrás
              </Button>

              <Button
                type="button"
                size="sm"
                className="rounded-full"
                disabled={!canGoNext}
                onClick={() =>
                  setStepIndex((s) => Math.min(TOTAL_STEPS - 1, s + 1))
                }
              >
                Siguiente
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

