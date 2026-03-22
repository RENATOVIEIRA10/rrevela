import { useState, useCallback, useEffect, useMemo } from "react";
import { Download, Copy, ExternalLink, X, Loader2, ChevronLeft } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  renderStoryToCanvas,
  type StoryData,
  type StoryTemplate,
  type StoryBackground,
  type StoryConfig,
  TEMPLATE_META,
  BACKGROUND_META,
} from "./StoryCard";

interface StoryShareSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: StoryData;
}

const TEMPLATES: StoryTemplate[] = ["classico", "insight", "palavra-do-dia", "estudo", "minimalista"];
const BACKGROUNDS: StoryBackground[] = ["escuro", "papel", "gradiente"];

// Small thumbnail renderer
function renderThumb(data: StoryData, template: StoryTemplate, bg: StoryBackground): string | null {
  try {
    const canvas = renderStoryToCanvas(data, { template, background: bg });
    return canvas.toDataURL("image/jpeg", 0.6);
  } catch {
    return null;
  }
}

const StoryShareSheet = ({ open, onOpenChange, data }: StoryShareSheetProps) => {
  const [step, setStep] = useState<"choose" | "share">("choose");
  const [template, setTemplate] = useState<StoryTemplate>("classico");
  const [background, setBackground] = useState<StoryBackground>("escuro");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  // Thumbnails for template picker
  const [thumbs, setThumbs] = useState<Record<string, string | null>>({});

  useEffect(() => {
    if (!open) { setStep("choose"); setPreviewUrl(null); setThumbs({}); return; }
    // Generate thumbnails async
    requestAnimationFrame(() => {
      const t: Record<string, string | null> = {};
      for (const tpl of TEMPLATES) {
        t[tpl] = renderThumb(data, tpl, background);
      }
      setThumbs(t);
    });
  }, [open, data, background]);

  // Generate full preview when going to share step
  useEffect(() => {
    if (step !== "share") { setPreviewUrl(null); return; }
    try {
      const canvas = renderStoryToCanvas(data, { template, background });
      setPreviewUrl(canvas.toDataURL("image/png"));
    } catch {
      // ignore
    }
  }, [step, template, background, data]);

  const config: StoryConfig = useMemo(() => ({ template, background }), [template, background]);

  const handleDownload = useCallback(async () => {
    setGenerating(true);
    try {
      const canvas = renderStoryToCanvas(data, config);
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), "image/png", 1)
      );
      if (!blob) throw new Error("no blob");

      if (navigator.share && navigator.canShare) {
        const file = new File([blob], `revela-story-${Date.now()}.png`, { type: "image/png" });
        if (navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({ files: [file] });
            toast({ title: "Compartilhado!", description: "Imagem enviada com sucesso." });
            setGenerating(false);
            return;
          } catch { /* fall through */ }
        }
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `revela-story-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Baixado!", description: "Imagem salva. Abra o Instagram e publique nos Stories." });
    } catch {
      toast({ title: "Erro", description: "Não foi possível gerar a imagem.", variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  }, [data, config]);

  const buildCaption = useCallback((): string => {
    const lines: string[] = [];
    lines.push(`📖 ${data.reference}`);
    if (data.verseText) lines.push(`"${data.verseText}"`);
    if (data.studyTitle) lines.push(data.studyTitle);
    if (data.insightText) lines.push(`\n${data.insightText}`);
    lines.push("\nvia Revela — rrevela.lovable.app");
    return lines.join("\n");
  }, [data]);

  const handleCopyCaption = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(buildCaption());
      toast({ title: "Copiado!", description: "Legenda copiada para colar no Instagram." });
    } catch {
      toast({ title: "Erro", description: "Não foi possível copiar.", variant: "destructive" });
    }
  }, [buildCaption]);

  const handleOpenInstagram = useCallback(() => {
    const mob = /iPad|iPhone|iPod|Android/.test(navigator.userAgent);
    if (mob) {
      window.location.href = "instagram://app";
      setTimeout(() => window.open("https://www.instagram.com", "_blank"), 1500);
    } else {
      window.open("https://www.instagram.com", "_blank");
    }
  }, []);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[94vh] rounded-t-2xl px-0">
        <SheetHeader className="px-5 pb-1">
          <SheetTitle className="text-base font-scripture flex items-center justify-between">
            <span className="flex items-center gap-2">
              {step === "share" && (
                <button onClick={() => setStep("choose")} className="p-1 rounded-full hover:bg-secondary">
                  <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
              {step === "choose" ? "Escolha um estilo" : "Compartilhar Story"}
            </span>
            <button onClick={() => onOpenChange(false)} className="p-1 rounded-full hover:bg-secondary">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </SheetTitle>
        </SheetHeader>

        <div className="overflow-y-auto max-h-[78vh] pb-6">
          <AnimatePresence mode="wait">
            {step === "choose" ? (
              <motion.div
                key="choose"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="px-5 space-y-5"
              >
                {/* Background selector */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Fundo</p>
                  <div className="flex gap-2">
                    {BACKGROUNDS.map((bg) => (
                      <button
                        key={bg}
                        onClick={() => setBackground(bg)}
                        className={`flex-1 h-10 rounded-xl border-2 transition-all text-xs font-medium ${
                          background === bg
                            ? "border-accent bg-accent/10 text-accent"
                            : "border-border bg-secondary/40 text-muted-foreground hover:border-accent/40"
                        }`}
                      >
                        {BACKGROUND_META[bg].label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Template grid */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Estilo</p>
                  <div className="grid grid-cols-2 gap-3">
                    {TEMPLATES.map((tpl) => {
                      const meta = TEMPLATE_META[tpl];
                      const thumb = thumbs[tpl];
                      const selected = template === tpl;
                      return (
                        <button
                          key={tpl}
                          onClick={() => setTemplate(tpl)}
                          className={`relative rounded-xl border-2 overflow-hidden transition-all ${
                            selected
                              ? "border-accent shadow-lg shadow-accent/20 ring-1 ring-accent/30"
                              : "border-border hover:border-accent/40"
                          }`}
                        >
                          <div className="aspect-[9/16] bg-secondary/30 flex items-center justify-center">
                            {thumb ? (
                              <img src={thumb} alt={meta.label} className="w-full h-full object-cover" />
                            ) : (
                              <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
                            )}
                          </div>
                          <div className="px-2.5 py-2 bg-background">
                            <p className="text-[11px] font-semibold text-foreground truncate">{meta.label}</p>
                            <p className="text-[10px] text-muted-foreground truncate">{meta.description}</p>
                          </div>
                          {selected && (
                            <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Continue */}
                <Button
                  onClick={() => setStep("share")}
                  className="w-full h-12 rounded-xl bg-accent text-accent-foreground hover:bg-accent/90 font-medium"
                >
                  Continuar
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="share"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="px-5 space-y-5"
              >
                {/* Preview */}
                <div className="flex justify-center">
                  <div
                    className="rounded-xl overflow-hidden shadow-lg border border-border"
                    style={{ width: 200, height: 356 }}
                  >
                    {previewUrl ? (
                      <img src={previewUrl} alt="Story preview" className="w-full h-full object-contain" />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-secondary/30">
                        <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2.5">
                  <Button
                    onClick={handleDownload}
                    disabled={generating}
                    className="w-full h-12 rounded-xl bg-accent text-accent-foreground hover:bg-accent/90 font-medium"
                  >
                    {generating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                    Baixar Imagem para Story
                  </Button>

                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleCopyCaption} className="flex-1 h-11 rounded-xl">
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar Legenda
                    </Button>
                    <Button variant="outline" onClick={handleOpenInstagram} className="flex-1 h-11 rounded-xl">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Abrir Instagram
                    </Button>
                  </div>
                </div>

                {/* Instructions */}
                <div className="rounded-xl bg-secondary/60 border border-border p-4 space-y-2">
                  <p className="text-xs font-medium text-foreground">Como publicar:</p>
                  <ol className="text-[11px] text-muted-foreground space-y-1 list-decimal list-inside">
                    <li>Toque em <strong>"Baixar Imagem"</strong></li>
                    <li>Toque em <strong>"Copiar Legenda"</strong> (opcional)</li>
                    <li>Abra o Instagram → Novo Story</li>
                    <li>Selecione a imagem na galeria</li>
                    <li>Cole a legenda se desejar</li>
                  </ol>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default StoryShareSheet;
