import { Palette } from "lucide-react";
import { HIGHLIGHT_COLORS } from "@/hooks/useHighlights";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const HighlightLegend = () => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-accent transition-colors px-2 py-1 rounded-md hover:bg-secondary/50"
          aria-label="Significado das marcas"
        >
          <Palette className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Marcas</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="end">
        <p className="text-xs text-muted-foreground font-scripture italic mb-3">
          Como este texto fala comigo?
        </p>
        <div className="space-y-2">
          {HIGHLIGHT_COLORS.map((c) => (
            <div key={c.key} className="flex items-center gap-2.5 text-sm">
              <span className="text-base">{c.emoji}</span>
              <span className="text-foreground/85 font-scripture">{c.label}</span>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default HighlightLegend;
