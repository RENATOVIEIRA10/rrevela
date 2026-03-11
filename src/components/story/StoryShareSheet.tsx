import { useState, useRef, useCallback, useEffect } from "react";
import { Download, Copy, ExternalLink, X, Loader2 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { renderStoryToCanvas, type StoryData } from "./StoryCard";

interface StoryShareSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: StoryData;
}

const StoryShareSheet = ({ open, onOpenChange, data }: StoryShareSheetProps) => {
  const previewRef = useRef<HTMLCanvasElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  // Generate preview when opened
  useEffect(() => {
    if (!open) {
      setPreviewUrl(null);
      return;
    }
    try {
      const canvas = renderStoryToCanvas(data);
      previewRef.current = canvas;
      setPreviewUrl(canvas.toDataURL("image/png"));
    } catch {
      // ignore
    }
  }, [open, data]);

  const handleDownload = useCallback(async () => {
    setGenerating(true);
    try {
      const canvas = renderStoryToCanvas(data);
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), "image/png", 1)
      );
      if (!blob) throw new Error("no blob");

      // Try Web Share API with file first (works on many mobile browsers)
      if (navigator.share && navigator.canShare) {
        const file = new File([blob], `revela-story-${Date.now()}.png`, { type: "image/png" });
        const shareData = { files: [file] };
        if (navigator.canShare(shareData)) {
          try {
            await navigator.share(shareData);
            toast({ title: "Compartilhado!", description: "Imagem enviada com sucesso." });
            setGenerating(false);
            return;
          } catch {
            // User cancelled or failed, fall through to download
          }
        }
      }

      // Fallback: download
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
  }, [data]);

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
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    if (isIOS || isAndroid) {
      window.location.href = "instagram://app";
      setTimeout(() => {
        window.open("https://www.instagram.com", "_blank");
      }, 1500);
    } else {
      window.open("https://www.instagram.com", "_blank");
    }
  }, []);

  const typeLabel = data.type === "study" ? "Estudo" : data.type === "verse-reveal" ? "Versículo + Revela" : "Versículo";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[92vh] rounded-t-2xl px-0">
        <SheetHeader className="px-6 pb-2">
          <SheetTitle className="text-base font-scripture flex items-center justify-between">
            <span>Story — {typeLabel}</span>
            <button onClick={() => onOpenChange(false)} className="p-1 rounded-full hover:bg-secondary">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </SheetTitle>
        </SheetHeader>

        <div className="overflow-y-auto max-h-[72vh] px-6 space-y-5 pb-6">
          {/* Preview */}
          <div className="flex justify-center">
            <div
              className="rounded-xl overflow-hidden shadow-lg border border-border bg-[#1A1C1E]"
              style={{ width: 200, height: 356 }}
            >
              {previewUrl ? (
                <img src={previewUrl} alt="Story preview" style={{ width: 200, height: 356, objectFit: "contain" }} />
              ) : (
                <div className="flex items-center justify-center h-full">
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
              {generating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
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
            <p className="text-xs font-medium text-foreground font-ui">Como publicar:</p>
            <ol className="text-[11px] text-muted-foreground font-ui space-y-1 list-decimal list-inside">
              <li>Toque em <strong>"Baixar Imagem"</strong></li>
              <li>Toque em <strong>"Copiar Legenda"</strong> (opcional)</li>
              <li>Abra o Instagram → Novo Story</li>
              <li>Selecione a imagem na galeria</li>
              <li>Cole a legenda se desejar</li>
            </ol>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default StoryShareSheet;
