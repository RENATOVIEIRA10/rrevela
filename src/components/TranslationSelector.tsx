import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const TRANSLATIONS = [
  { value: "acf", label: "ACF", fullName: "Almeida Corrigida Fiel" },
  { value: "ara", label: "ARA", fullName: "Almeida Revisada" },
  { value: "nvi", label: "NVI", fullName: "Nova Versão Internacional" },
] as const;

export type TranslationKey = (typeof TRANSLATIONS)[number]["value"];

interface TranslationSelectorProps {
  value: TranslationKey;
  onChange: (v: TranslationKey) => void;
}

const TranslationSelector = ({ value, onChange }: TranslationSelectorProps) => (
  <ToggleGroup
    type="single"
    value={value}
    onValueChange={(v) => {
      if (v) onChange(v as TranslationKey);
    }}
    size="sm"
    className="bg-secondary/40 rounded-lg p-0.5"
  >
    {TRANSLATIONS.map((t) => (
      <Tooltip key={t.value}>
        <TooltipTrigger asChild>
          <ToggleGroupItem
            value={t.value}
            className="text-[11px] px-2.5 py-1 h-auto rounded-md data-[state=on]:bg-accent data-[state=on]:text-accent-foreground font-medium"
          >
            {t.label}
          </ToggleGroupItem>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          {t.fullName}
        </TooltipContent>
      </Tooltip>
    ))}
  </ToggleGroup>
);

export default TranslationSelector;
