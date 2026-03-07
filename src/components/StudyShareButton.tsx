import { useState } from "react";
import { Share2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import ShareMenu from "./ShareMenu";
import { useShareStudy, type StudyMode } from "@/hooks/useShareStudy";

interface StudyShareButtonProps {
  book: string;
  chapter: number;
  mode: StudyMode;
  title: string;
  summary: string;
  insightText: string;
}

const StudyShareButton = ({ book, chapter, mode, title, summary, insightText }: StudyShareButtonProps) => {
  const [showMenu, setShowMenu] = useState(false);
  const { shareStudy } = useShareStudy();

  const handleShare = (method: "copy" | "whatsapp" | "native") => {
    shareStudy({ book, chapter, mode, title, summary, insightText }, method);
    setShowMenu(false);
  };

  return (
    <div className="space-y-2">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-accent transition-colors"
      >
        <Share2 className="w-3.5 h-3.5" />
        Compartilhar estudo
      </button>
      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <ShareMenu onShare={handleShare} label="Compartilhar estudo" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudyShareButton;
