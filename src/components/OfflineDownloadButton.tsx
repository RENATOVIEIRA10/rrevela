import { useState, useEffect } from "react";
import { Download, Check, Loader2, Trash2, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  downloadTranslationOffline,
  isTranslationOffline,
  deleteOfflineTranslation,
  getOfflineInfo,
} from "@/lib/offline-bible";
import { useToast } from "@/hooks/use-toast";

const TRANSLATION_NAMES: Record<string, string> = {
  acf: "ACF",
  arc: "ARC",
  aa: "AA",
  tb: "TB",
};

const OfflineDownloadButton = () => {
  const { toast } = useToast();
  const [downloading, setDownloading] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [offlineTranslations, setOfflineTranslations] = useState<string[]>([]);

  useEffect(() => {
    loadOfflineStatus();
  }, []);

  const loadOfflineStatus = async () => {
    const info = await getOfflineInfo();
    setOfflineTranslations(info.map((i) => i.translation));
  };

  const handleDownload = async (translation: string) => {
    setDownloading(translation);
    setProgress(0);
    try {
      const count = await downloadTranslationOffline(translation, setProgress);
      toast({
        title: "Download concluído",
        description: `${TRANSLATION_NAMES[translation]}: ${count.toLocaleString()} versículos salvos offline.`,
      });
      await loadOfflineStatus();
    } catch (err) {
      toast({
        title: "Erro no download",
        description: "Não foi possível baixar. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setDownloading(null);
      setProgress(0);
    }
  };

  const handleDelete = async (translation: string) => {
    await deleteOfflineTranslation(translation);
    toast({ title: `${TRANSLATION_NAMES[translation]} removida do offline` });
    await loadOfflineStatus();
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <WifiOff className="w-4 h-4 text-muted-foreground" />
        Bíblia Offline
      </div>

      {Object.entries(TRANSLATION_NAMES).map(([key, label]) => {
        const isOffline = offlineTranslations.includes(key);
        const isDownloading = downloading === key;

        return (
          <div key={key} className="flex items-center justify-between gap-2">
            <span className="text-sm text-foreground/80">{label}</span>

            {isDownloading ? (
              <div className="flex items-center gap-2 flex-1 max-w-[180px]">
                <Progress value={progress} className="h-2 flex-1" />
                <span className="text-[10px] text-muted-foreground w-8">{progress}%</span>
              </div>
            ) : isOffline ? (
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-green-500" />
                <span className="text-[10px] text-green-600">Salvo</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => handleDelete(key)}
                >
                  <Trash2 className="w-3 h-3 text-muted-foreground" />
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1.5"
                onClick={() => handleDownload(key)}
                disabled={!!downloading}
              >
                <Download className="w-3 h-3" />
                Baixar
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default OfflineDownloadButton;
