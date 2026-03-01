import { motion } from "framer-motion";
import { X } from "lucide-react";
import { HIGHLIGHT_COLORS, type HighlightColor } from "@/hooks/useHighlights";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";

interface VersePanelProps {
  open: boolean;
  onClose: () => void;
  verseNumber: number;
  verseText: string;
  currentColor: HighlightColor | null;
  onSelectColor: (color: HighlightColor | null) => void;
}

const VersePanel = ({
  open,
  onClose,
  verseNumber,
  verseText,
  currentColor,
  onSelectColor,
}: VersePanelProps) => {
  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
      <DrawerContent className="max-h-[60vh]">
        <DrawerHeader className="text-left pb-2">
          <DrawerTitle className="font-scripture text-base">
            Versículo {verseNumber}
          </DrawerTitle>
          <DrawerDescription className="font-scripture text-sm text-foreground/80 italic leading-relaxed">
            {verseText}
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-4 pb-6 space-y-4">
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
            Marcar como
          </p>

          <div className="flex flex-wrap gap-2">
            {HIGHLIGHT_COLORS.map((color) => {
              const isActive = currentColor === color.key;
              return (
                <motion.button
                  key={color.key}
                  whileTap={{ scale: 0.95 }}
                  onClick={() =>
                    onSelectColor(isActive ? null : color.key)
                  }
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all border ${
                    isActive
                      ? "border-accent bg-accent/10 text-accent font-medium"
                      : "border-border bg-secondary/50 text-foreground/80 hover:bg-secondary"
                  }`}
                >
                  <span>{color.emoji}</span>
                  <span>{color.label}</span>
                </motion.button>
              );
            })}
          </div>

          {currentColor && (
            <button
              onClick={() => onSelectColor(null)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors"
            >
              <X className="w-3 h-3" />
              Remover marca
            </button>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default VersePanel;
