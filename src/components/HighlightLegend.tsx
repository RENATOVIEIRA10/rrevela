import { useState } from "react";
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
          aria-label="Legenda de cores"
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Legenda</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-3" align="end">
        <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-2">
          Cores fixas
        </p>
        <div className="space-y-1.5">
          {HIGHLIGHT_COLORS.map((c) => (
            <div key={c.key} className="flex items-center gap-2 text-sm">
              <span>{c.emoji}</span>
              <span className="text-foreground/85">{c.label}</span>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default HighlightLegend;
