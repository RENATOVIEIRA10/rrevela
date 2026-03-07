import { Share2, Copy, MessageCircle } from "lucide-react";

interface ShareMenuProps {
  onShare: (method: "copy" | "whatsapp" | "native") => void;
  label?: string;
}

const ShareMenu = ({ onShare, label = "Compartilhar" }: ShareMenuProps) => {
  return (
    <div>
      <p className="text-xs text-muted-foreground font-ui mb-2">{label}</p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigator.share ? onShare("native") : onShare("copy")}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm border border-border bg-secondary/50 text-foreground/80 hover:bg-secondary transition-colors"
        >
          <Share2 className="w-3.5 h-3.5" />
          {navigator.share ? "Compartilhar" : "Copiar"}
        </button>
        <button
          onClick={() => onShare("whatsapp")}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm border border-border bg-secondary/50 text-foreground/80 hover:bg-secondary transition-colors"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          WhatsApp
        </button>
        {navigator.share && (
          <button
            onClick={() => onShare("copy")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm border border-border bg-secondary/50 text-foreground/80 hover:bg-secondary transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
            Copiar
          </button>
        )}
      </div>
    </div>
  );
};

export default ShareMenu;
