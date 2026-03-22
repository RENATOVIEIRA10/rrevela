import { BookOpen } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import EstudoRevela from "./EstudoRevela";
import type { StructuredNote, NoteType } from "@/hooks/useNotes";

interface NotebookSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  book: string;
  chapter: number;
  verse?: number;
  verseText?: string;
  aiRevelation?: string;
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
  verseText,
  aiRevelation,
  notes,
  onSave,
  onDelete,
}: NotebookSheetProps) => {
  const reference = verse !== undefined
    ? `${book} ${chapter}:${verse}`
    : `${book} ${chapter}`;

  const existingNote = notes[0] as StructuredNote | undefined;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl px-0">
        <SheetHeader className="px-5 text-left pb-3 border-b border-border/50">
          <SheetTitle className="font-scripture text-base flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-accent" />
            {reference}
          </SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground">
            Método Revela — Ver · Revelar · Viver
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 h-full">
          <div className="px-5 py-4 pb-20">
            <EstudoRevela
              book={book}
              chapter={chapter}
              verse={verse}
              verseText={verseText}
              aiRevelation={aiRevelation}
              existingNote={existingNote}
              onSave={onSave}
              onDelete={existingNote ? onDelete : undefined}
              onClose={() => onOpenChange(false)}
            />
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default NotebookSheet;
