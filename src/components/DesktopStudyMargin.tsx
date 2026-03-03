import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Pin, StickyNote, Cross, Repeat, HelpCircle, BookOpen } from "lucide-react";
import NoteEditor from "./NoteEditor";
import MessianicLinePanel from "./MessianicLinePanel";
import BiblicalPatternsPanel from "./BiblicalPatternsPanel";
import RevealingQuestions from "./RevealingQuestions";
import DepthSelector, { type DepthLevel } from "./DepthSelector";
import CompareOlhares from "./CompareOlhares";
import type { StructuredNote, NoteType } from "@/hooks/useNotes";

interface PinnedVerse {
  number: number;
  text: string;
}

interface DesktopStudyMarginProps {
  book: string;
  chapter: number;
  depth: DepthLevel;
  onDepthChange: (d: DepthLevel) => void;
  pinnedVerse: PinnedVerse | null;
  onUnpin: () => void;
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
            <div className="bg-accent/5 border border-accent/15 rounded-lg p-3 space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-[9px] uppercase tracking-widest text-accent font-medium flex items-center gap-1">
                  <Pin className="w-3 h-3" /> Verso fixado
                </p>
                <button onClick={onUnpin} className="text-[10px] text-muted-foreground hover:text-foreground">
                  Soltar
                </button>
              </div>
              <p className="font-scripture text-xs text-accent font-semibold">
                {book} {chapter}:{pinnedVerse.number}
              </p>
              <p className="font-scripture text-sm text-foreground/85 leading-relaxed italic">
                {pinnedVerse.text}
              </p>
            </div>
          )}

          {activeTab === "study" && (
            <>
              <DepthSelector value={depth} onChange={onDepthChange} />
              <MessianicLinePanel book={book} chapter={chapter} />
              {(depth === "intermediario" || depth === "profundo") && (
                <BiblicalPatternsPanel book={book} chapter={chapter} depth={depth} />
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
                    book={book}
                    chapter={chapter}
                    verse={pinnedVerse.number}
                    verseText={pinnedVerse.text}
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
                    onClick={() => onSelectVerseForNote(pinnedVerse.number)}
                    className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                      selectedVerseForNote === pinnedVerse.number
                        ? "bg-accent/10 text-accent font-medium"
                        : "bg-secondary/40 text-foreground/60 hover:bg-secondary"
                    }`}
                  >
                    v. {pinnedVerse.number}
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
