import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import RedemptionTimeline from "./RedemptionTimeline";
import HistoricalContextPanel from "./HistoricalContextPanel";
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
    <div className="h-full flex flex-col border-l border-border/50 bg-sidebar/30">
      {/* Elegant tabs */}
      <div className="flex border-b border-border/40">
        <button
          onClick={() => setActiveTab("study")}
          className={`flex-1 text-xs py-3 font-ui font-medium transition-all duration-200 ${
            activeTab === "study"
              ? "text-accent border-b-2 border-accent -mb-px"
              : "text-muted-foreground/70 hover:text-foreground"
          }`}
        >
          Estudo
        </button>
        <button
          onClick={() => setActiveTab("notes")}
          className={`flex-1 text-xs py-3 font-ui font-medium transition-all duration-200 ${
            activeTab === "notes"
              ? "text-accent border-b-2 border-accent -mb-px"
              : "text-muted-foreground/70 hover:text-foreground"
          }`}
        >
          Anotações
        </button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-5 space-y-5">
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
              <HistoricalContextPanel book={book} chapter={chapter} />
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
                <div className="pt-5">
                  <div className="editorial-divider mb-5" />
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
              {/* Verse/Chapter selector — refined chips */}
              <div className="flex gap-2">
                <button
                  onClick={() => onSelectVerseForNote(undefined)}
                  className={`text-xs px-3.5 py-2 rounded-xl transition-all font-ui ${
                    selectedVerseForNote === undefined
                      ? "bg-accent/10 text-accent font-medium border border-accent/15"
                      : "bg-secondary/30 text-foreground/60 hover:bg-secondary/50 border border-transparent"
                  }`}
                >
                  Capítulo
                </button>
                {pinnedVerse && (
                  <button
                    onClick={() => onSelectVerseForNote(pinnedVerse.verse)}
                    className={`text-xs px-3.5 py-2 rounded-xl transition-all font-ui ${
                      selectedVerseForNote === pinnedVerse.verse
                        ? "bg-accent/10 text-accent font-medium border border-accent/15"
                        : "bg-secondary/30 text-foreground/60 hover:bg-secondary/50 border border-transparent"
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
                <div className="space-y-3 pt-5">
                  <div className="editorial-divider mb-4" />
                  <p className="text-[9px] uppercase tracking-widest text-muted-foreground/60 font-ui font-medium">
                    Anteriores
                  </p>
                  {activeNotes.notes.slice(1).map((prevNote) => (
                    <div
                      key={prevNote.id}
                      className="bg-secondary/20 rounded-xl p-4 space-y-1.5 border border-border/30"
                    >
                      <p className="text-[10px] text-muted-foreground/60 font-ui">
                        {new Date(prevNote.created_at).toLocaleDateString("pt-BR")}
                      </p>
                      {prevNote.observation && (
                        <p className="text-sm text-foreground/70 font-scripture line-clamp-3">{prevNote.observation}</p>
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
