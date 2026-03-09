import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const TRANSLATIONS = [
  { value: "acf", label: "ACF" },
  { value: "nvi", label: "NVI" },
  { value: "arc", label: "ARC" },
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
      <ToggleGroupItem
        key={t.value}
        value={t.value}
        className="text-[11px] px-2.5 py-1 h-auto rounded-md data-[state=on]:bg-accent data-[state=on]:text-accent-foreground font-medium"
      >
        {t.label}
      </ToggleGroupItem>
    ))}
  </ToggleGroup>
);

export default TranslationSelector;
