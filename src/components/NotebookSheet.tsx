import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, StickyNote, BookOpen, ChevronRight } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import NoteEditor from "./NoteEditor";
import type { StructuredNote, NoteType } from "@/hooks/useNotes";

interface NotebookSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  book: string;
  chapter: number;
  verse?: number;
  notes: StructuredNote[];
  onSave: (note: Partial<StructuredNote> & { type: NoteType }) => Promise<StructuredNote | null>;
  onDelete: (id: string) => Promise<void>;
}

const NotebookSheet = ({
  open,
  onOpenChange,
  book,
  chapter,
  verse,
  notes,
  onSave,
  onDelete,
}: NotebookSheetProps) => {
  const [mode, setMode] = useState<"list" | "quick" | "full">("list");
  const [quickText, setQuickText] = useState("");
  const [saving, setSaving] = useState(false);

  const noteType: NoteType = verse !== undefined ? "verse" : "chapter";
  const existingNote = notes[0];

  const handleQuickSave = async () => {
    if (!quickText.trim()) return;
    setSaving(true);
    await onSave({
      type: noteType,
      book,
      chapter,
      verse: verse ?? null,
      observation: quickText,
      interpretation: "",
      christocentric: "",
      application: "",
      prayer: "",
    });
    setQuickText("");
    setSaving(false);
    setMode("list");
  };

  const reference = verse !== undefined
    ? `${book} ${chapter}:${verse}`
    : `${book} ${chapter}`;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl px-0">
        <SheetHeader className="px-5 text-left pb-3 border-b border-border/50">
          <SheetTitle className="font-scripture text-base flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-accent" />
            {reference}
          </SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground">
            Seu caderno de estudo
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 h-full">
          <div className="px-5 py-4 pb-20">
            <AnimatePresence mode="wait">
              {mode === "list" && (
                <motion.div
                  key="list"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  {/* Action buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setMode("quick")}
                      className="flex-1 flex items-center gap-2 p-3 rounded-xl border border-dashed border-border bg-secondary/20 hover:bg-secondary/40 transition-colors"
                    >
                      <StickyNote className="w-4 h-4 text-accent" />
                      <div className="text-left">
                        <p className="text-xs font-medium text-foreground">Nota rápida</p>
                        <p className="text-[10px] text-muted-foreground">Tipo post-it</p>
                      </div>
                    </button>
                    <button
                      onClick={() => setMode("full")}
                      className="flex-1 flex items-center gap-2 p-3 rounded-xl border border-dashed border-border bg-secondary/20 hover:bg-secondary/40 transition-colors"
                    >
                      <BookOpen className="w-4 h-4 text-accent" />
                      <div className="text-left">
                        <p className="text-xs font-medium text-foreground">Página de estudo</p>
                        <p className="text-[10px] text-muted-foreground">Estudo completo</p>
                      </div>
                    </button>
                  </div>

                  {/* Existing notes */}
                  {notes.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-medium">
                        Suas anotações
                      </p>
                      {notes.map((note) => (
                        <motion.div
                          key={note.id}
                          className="notebook-page rounded-xl p-4 space-y-2"
                          whileTap={{ scale: 0.99 }}
                          onClick={() => setMode("full")}
                        >
                          <div className="flex items-center justify-between">
                            <p className="text-[10px] text-muted-foreground">
                              {new Date(note.created_at).toLocaleDateString("pt-BR", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })}
                            </p>
                            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                          </div>
                          {note.observation && (
                            <p className="font-scripture text-sm text-foreground/85 leading-relaxed line-clamp-4">
                              {note.observation}
                            </p>
                          )}
                          {note.christocentric && (
                            <p className="text-xs text-accent/80 font-scripture line-clamp-2 italic">
                              ✝️ {note.christocentric}
                            </p>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {notes.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-sm text-muted-foreground font-scripture italic">
                        Nenhuma anotação ainda.
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Comece com uma nota rápida ou uma página de estudo.
                      </p>
                    </div>
                  )}
                </motion.div>
              )}

              {mode === "quick" && (
                <motion.div
                  key="quick"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-3"
                >
                  <button
                    onClick={() => setMode("list")}
                    className="text-xs text-accent flex items-center gap-1"
                  >
                    ← Voltar
                  </button>

                  <div className="notebook-page rounded-xl p-4 space-y-3">
                    <p className="text-[9px] uppercase tracking-widest text-muted-foreground">
                      Nota rápida — {reference}
                    </p>
                    <Textarea
                      value={quickText}
                      onChange={(e) => setQuickText(e.target.value)}
                      placeholder="O que este texto fala ao seu coração?"
                      className="min-h-[120px] bg-transparent border-0 font-scripture text-sm resize-none focus-visible:ring-0 p-0 placeholder:text-muted-foreground/50"
                      autoFocus
                    />
                  </div>

                  <Button
                    onClick={handleQuickSave}
                    disabled={saving || !quickText.trim()}
                    className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-scripture"
                    size="sm"
                  >
                    {saving ? "Salvando..." : "Guardar nota"}
                  </Button>
                </motion.div>
              )}

              {mode === "full" && (
                <motion.div
                  key="full"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-3"
                >
                  <button
                    onClick={() => setMode("list")}
                    className="text-xs text-accent flex items-center gap-1"
                  >
                    ← Voltar
                  </button>

                  <div className="notebook-page rounded-xl p-4">
                    <NoteEditor
                      note={existingNote}
                      noteType={noteType}
                      book={book}
                      chapter={chapter}
                      verse={verse}
                      onSave={onSave}
                      onDelete={existingNote ? onDelete : undefined}
                      onClose={() => setMode("list")}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default NotebookSheet;
