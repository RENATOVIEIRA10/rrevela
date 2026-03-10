import { useState, useRef, useCallback } from "react";
import html2canvas from "html2canvas";
import { Download, Copy, ExternalLink, X, Loader2 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import StoryCard, { type StoryData } from "./StoryCard";

interface StoryShareSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: StoryData;
}

const StoryShareSheet = ({ open, onOpenChange, data }: StoryShareSheetProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);

  const generateImage = useCallback(async (): Promise<Blob | null> => {
    if (!cardRef.current) return null;
    setGenerating(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: "#1A1C1E",
        useCORS: true,
        logging: false,
        allowTaint: true,
        removeContainer: true,
      });
      return new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob), "image/png", 1);
      });
    } catch {
      toast({ title: "Erro", description: "Não foi possível gerar a imagem.", variant: "destructive" });
      return null;
    } finally {
      setGenerating(false);
    }
  }, []);

  const handleDownload = useCallback(async () => {
    const blob = await generateImage();
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `revela-story-${Date.now()}.png`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Baixado!", description: "Imagem salva. Abra o Instagram e publique nos Stories." });
  }, [generateImage]);

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
    // Try the Instagram app URL scheme, fallback to web
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);

    if (isIOS || isAndroid) {
      window.location.href = "instagram://app";
      // Fallback after a brief delay
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
          {/* Preview — scaled down to fit screen */}
          <div className="flex justify-center">
            <div
              className="rounded-xl overflow-hidden shadow-lg border border-border"
              style={{ width: 200, height: 356 }}
            >
              <div style={{ transform: "scale(0.5556)", transformOrigin: "top left", width: 360, height: 640 }}>
                <StoryCard ref={cardRef} data={data} />
              </div>
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
              <Button
                variant="outline"
                onClick={handleCopyCaption}
                className="flex-1 h-11 rounded-xl"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copiar Legenda
              </Button>
              <Button
                variant="outline"
                onClick={handleOpenInstagram}
                className="flex-1 h-11 rounded-xl"
              >
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
