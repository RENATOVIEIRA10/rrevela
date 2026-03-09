import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import RedemptionTimeline from "./RedemptionTimeline";
import HistoricalContextPanel from "./HistoricalContextPanel";
import { Pin, StickyNote, Cross, Repeat, HelpCircle, BookOpen } from "lucide-react";
import NoteEditor from "./NoteEditor";
import MessianicLinePanel from "./MessianicLinePanel";
import BiblicalPatternsPanel from "./BiblicalPatternsPanel";
import RevealingQuestions from "./RevealingQuestions";
import DepthSelector, { type DepthLevel } from "./DepthSelector";
import CompareOlhares from "./CompareOlhares";
import PinnedVerseCard from "./PinnedVerseCard";
import type { StructuredNote, NoteType } from "@/hooks/useNotes";
import type { PinnedVerseData } from "@/hooks/usePinnedVerse";

interface DesktopStudyMarginProps {
  book: string;
  chapter: number;
  depth: DepthLevel;
  onDepthChange: (d: DepthLevel) => void;
  pinnedVerse: PinnedVerseData | null;
  onUnpin: () => void;
  onGoToPinned: (book: string, chapter: number, verse: number) => void;
  onNavigateToRef?: (book: string, chapter: number, verse: number) => void;
  // Notes
  chapterNotes: {
    notes: StructuredNote[];
    saveNote: (note: Partial<StructuredNote> & { type: NoteType }) => Promise<StructuredNote | null>;
    deleteNote: (id: string) => Promise<void>;
  };
  verseNotes: {
    notes: StructuredNote[];
    saveNote: (note: Partial<StructuredNote> & { type: NoteType }) => Promise<StructuredNote | null>;
    deleteNote: (id: string) => Promise<void>;
  };
  selectedVerseForNote: number | undefined;
  onSelectVerseForNote: (v: number | undefined) => void;
}

const DesktopStudyMargin = ({
  book,
  chapter,
  depth,
  onDepthChange,
  pinnedVerse,
  onUnpin,
  onGoToPinned,
  onNavigateToRef,
  chapterNotes,
  verseNotes,
  selectedVerseForNote,
  onSelectVerseForNote,
}: DesktopStudyMarginProps) => {
  const [activeTab, setActiveTab] = useState<"notes" | "study">("study");

  const activeNotes = selectedVerseForNote !== undefined ? verseNotes : chapterNotes;
  const noteType: NoteType = selectedVerseForNote !== undefined ? "verse" : "chapter";
  const existingNote = activeNotes.notes[0];

  return (
    <div className="h-full flex flex-col border-l border-border bg-card/30">
      {/* Tabs */}
      <div className="flex border-b border-border/50">
        <button
          onClick={() => setActiveTab("study")}
          className={`flex-1 text-xs py-2.5 font-medium transition-colors ${
            activeTab === "study"
              ? "text-accent border-b-2 border-accent"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Estudo
        </button>
        <button
          onClick={() => setActiveTab("notes")}
          className={`flex-1 text-xs py-2.5 font-medium transition-colors ${
            activeTab === "notes"
              ? "text-accent border-b-2 border-accent"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Anotações
        </button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Pinned verse */}
          {pinnedVerse && (
            <PinnedVerseCard
              pinned={pinnedVerse}
              onGoTo={onGoToPinned}
              onUnpin={onUnpin}
            />
          )}

          {activeTab === "study" && (
            <>
              <DepthSelector value={depth} onChange={onDepthChange} />
              <RedemptionTimeline book={book} chapter={chapter} />
              <MessianicLinePanel book={book} chapter={chapter} onNavigate={onNavigateToRef} />
              {(depth === "intermediario" || depth === "profundo") && (
                <BiblicalPatternsPanel book={book} chapter={chapter} depth={depth} onNavigate={onNavigateToRef} />
              )}
              <RevealingQuestions
                depth={depth}
                onApplyQuestion={() => {
                  setActiveTab("notes");
                  onSelectVerseForNote(undefined);
                }}
              />

              {/* Cross references for pinned verse */}
              {pinnedVerse && (
                <div className="border-t border-border/50 pt-4">
                  <CompareOlhares
                    book={pinnedVerse.book}
                    chapter={pinnedVerse.chapter}
                    verse={pinnedVerse.verse}
                    verseText={pinnedVerse.text ?? ""}
                  />
                </div>
              )}
            </>
          )}

          {activeTab === "notes" && (
            <>
              {/* Verse/Chapter selector */}
              <div className="flex gap-2">
                <button
                  onClick={() => onSelectVerseForNote(undefined)}
                  className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                    selectedVerseForNote === undefined
                      ? "bg-accent/10 text-accent font-medium"
                      : "bg-secondary/40 text-foreground/60 hover:bg-secondary"
                  }`}
                >
                  Capítulo
                </button>
                {pinnedVerse && (
                  <button
                    onClick={() => onSelectVerseForNote(pinnedVerse.verse)}
                    className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                      selectedVerseForNote === pinnedVerse.verse
                        ? "bg-accent/10 text-accent font-medium"
                        : "bg-secondary/40 text-foreground/60 hover:bg-secondary"
                    }`}
                  >
                    v. {pinnedVerse.verse}
                  </button>
                )}
              </div>

              <NoteEditor
                note={existingNote}
                noteType={noteType}
                book={book}
                chapter={chapter}
                verse={selectedVerseForNote}
                onSave={activeNotes.saveNote}
                onDelete={existingNote ? activeNotes.deleteNote : undefined}
              />

              {activeNotes.notes.length > 1 && (
                <div className="space-y-3 border-t border-border/50 pt-4">
                  <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-medium">
                    Anteriores
                  </p>
                  {activeNotes.notes.slice(1).map((prevNote) => (
                    <div
                      key={prevNote.id}
                      className="bg-secondary/20 rounded-lg p-3 space-y-1.5 border border-border/30"
                    >
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(prevNote.created_at).toLocaleDateString("pt-BR")}
                      </p>
                      {prevNote.observation && (
                        <p className="text-xs text-foreground/70 font-scripture line-clamp-3">{prevNote.observation}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default DesktopStudyMargin;
