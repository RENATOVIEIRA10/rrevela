import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, ArrowRight, Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ShareMenu from "@/components/ShareMenu";
import { useToast } from "@/hooks/use-toast";

interface VerseOfDayCardProps {
  verse: { book: string; chapter: number; verse: number; text: string } | null;
  loading: boolean;
}

const VerseOfDayCard = ({ verse, loading }: VerseOfDayCardProps) => {
  const navigate = useNavigate();
  const [showShare, setShowShare] = useState(false);
  const { toast } = useToast();

  if (loading) {
    return (
      <div className="p-5 animate-pulse space-y-3">
        <div className="h-3 bg-secondary/50 rounded w-1/3" />
        <div className="h-4 bg-secondary/50 rounded w-full" />
        <div className="h-4 bg-secondary/50 rounded w-2/3" />
      </div>
    );
  }

  if (!verse) return null;

  const ref = `${verse.book} ${verse.chapter}:${verse.verse}`;
  const shareText = `☀️ Versículo do dia\n\n"${verse.text}"\n\n— ${ref}\n\n📖 Revela: O Evangelho nas Escrituras`;
  const url = window.location.origin;

  const handleShare = (method: "copy" | "whatsapp" | "native") => {
    if (method === "native" && navigator.share) {
      navigator.share({ title: `Versículo do dia — ${ref}`, text: shareText, url });
    } else if (method === "whatsapp") {
      window.open(`https://wa.me/?text=${encodeURIComponent(shareText + "\n" + url)}`, "_blank");
    } else {
      navigator.clipboard.writeText(shareText + "\n" + url);
      toast({ title: "Copiado!", description: "Versículo copiado para a área de transferência." });
    }
    setShowShare(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 space-y-4 bg-card rounded-xl"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="flex items-center gap-2">
        <Sun className="w-3.5 h-3.5 text-accent/60" />
        <span className="text-[10px] uppercase tracking-[0.2em] text-accent/70 font-medium">
          Versículo do dia
        </span>
      </div>

      <p className="font-scripture text-base text-foreground leading-[2]">
        "{verse.text}"
      </p>

      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-accent/70">{ref}</span>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowShare(!showShare)}
            className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-accent transition-colors"
          >
            <Share2 className="w-3 h-3" />
            Compartilhar
          </button>
          <button
            onClick={() => navigate("/revela")}
            className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-accent transition-colors"
          >
            Aprofundar
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showShare && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <ShareMenu onShare={handleShare} label="Compartilhar versículo do dia" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default VerseOfDayCard;
