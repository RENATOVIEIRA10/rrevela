import DepthSelector, { type DepthLevel } from "@/components/DepthSelector";
import RedemptionTimeline from "@/components/RedemptionTimeline";
import HistoricalContextPanel from "@/components/HistoricalContextPanel";
import MessianicLinePanel from "@/components/MessianicLinePanel";
import BiblicalPatternsPanel from "@/components/BiblicalPatternsPanel";
import RevealingQuestions from "@/components/RevealingQuestions";

interface MobileStudyToolsProps {
  book: string;
  chapter: number;
  depth: DepthLevel;
  onDepthChange: (depth: DepthLevel) => void;
  onNavigate: (book: string, chapter: number, verse: number) => void;
  onOpenNote: () => void;
}

export default function MobileStudyTools({
  book, chapter, depth, onDepthChange, onNavigate, onOpenNote,
}: MobileStudyToolsProps) {
  return (
    <div className="mt-12 pt-8 space-y-5">
      <div className="editorial-divider mb-6" />
      <DepthSelector value={depth} onChange={onDepthChange} />
      <RedemptionTimeline book={book} chapter={chapter} />
      <HistoricalContextPanel book={book} chapter={chapter} />
      <MessianicLinePanel book={book} chapter={chapter} onNavigate={onNavigate} />
      {(depth === "intermediario" || depth === "profundo") && (
        <BiblicalPatternsPanel book={book} chapter={chapter} depth={depth} onNavigate={onNavigate} />
      )}
      <RevealingQuestions depth={depth} onApplyQuestion={onOpenNote} />
    </div>
  );
}
