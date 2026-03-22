import { BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { ParsedReference } from "@/lib/reference-parser";

interface ReferenceChipProps {
  reference: ParsedReference;
  label?: string;
  onNavigate?: (book: string, chapter: number, verse: number) => void;
}

const ReferenceChip = ({ reference, label, onNavigate }: ReferenceChipProps) => {
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onNavigate) {
      onNavigate(reference.book, reference.chapter, reference.verseStart);
    } else {
      // Navigate to reader with query params
      navigate(`/leitor?livro=${encodeURIComponent(reference.book)}&cap=${reference.chapter}&v=${reference.verseStart}`, { state: { book: reference.book, chapter: reference.chapter } });
    }
  };

  const displayLabel = label || reference.raw;

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-ui font-medium text-accent bg-accent/5 hover:bg-accent/15 transition-colors cursor-pointer border border-accent/10 hover:border-accent/30"
      title={`Abrir ${displayLabel}`}
    >
      <BookOpen className="w-3 h-3 shrink-0" />
      <span>{displayLabel}</span>
    </button>
  );
};

export default ReferenceChip;
