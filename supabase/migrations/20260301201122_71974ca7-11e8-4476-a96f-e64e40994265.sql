
-- Create note type enum
CREATE TYPE public.note_type AS ENUM ('verse', 'chapter', 'theme');

-- Create structured notes table
CREATE TABLE public.structured_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type public.note_type NOT NULL DEFAULT 'verse',
  book TEXT,
  chapter INTEGER,
  verse INTEGER,
  theme_label TEXT,
  observation TEXT DEFAULT '',
  interpretation TEXT DEFAULT '',
  christocentric TEXT DEFAULT '',
  application TEXT DEFAULT '',
  prayer TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.structured_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notes" ON public.structured_notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own notes" ON public.structured_notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own notes" ON public.structured_notes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notes" ON public.structured_notes FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_structured_notes_updated_at BEFORE UPDATE ON public.structured_notes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes
CREATE INDEX idx_notes_user_book_chapter ON public.structured_notes(user_id, book, chapter);
CREATE INDEX idx_notes_user_verse ON public.structured_notes(user_id, book, chapter, verse);
CREATE INDEX idx_notes_user_type ON public.structured_notes(user_id, type);
