
-- Create bible_verses table
CREATE TABLE public.bible_verses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  book TEXT NOT NULL,
  chapter INTEGER NOT NULL,
  verse INTEGER NOT NULL,
  text TEXT NOT NULL,
  translation TEXT NOT NULL DEFAULT 'acf',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unique constraint
ALTER TABLE public.bible_verses ADD CONSTRAINT bible_verses_unique UNIQUE (book, chapter, verse, translation);

-- Create indexes for fast lookups
CREATE INDEX idx_bible_verses_book_chapter ON public.bible_verses (book, chapter);
CREATE INDEX idx_bible_verses_translation ON public.bible_verses (translation);

-- Full-text search index
ALTER TABLE public.bible_verses ADD COLUMN text_search tsvector 
  GENERATED ALWAYS AS (to_tsvector('portuguese', text)) STORED;
CREATE INDEX idx_bible_verses_fts ON public.bible_verses USING GIN (text_search);

-- Enable RLS but allow public read access (Bible text is public domain)
ALTER TABLE public.bible_verses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Bible verses are publicly readable"
ON public.bible_verses
FOR SELECT
USING (true);

-- Only service role can insert/update/delete
CREATE POLICY "Service role can manage bible verses"
ON public.bible_verses
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Search function
CREATE OR REPLACE FUNCTION public.search_bible(search_query TEXT, translation_filter TEXT DEFAULT 'acf', result_limit INTEGER DEFAULT 50)
RETURNS TABLE (
  book TEXT,
  chapter INTEGER,
  verse INTEGER,
  text TEXT,
  rank REAL
)
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    bv.book,
    bv.chapter,
    bv.verse,
    bv.text,
    ts_rank(bv.text_search, plainto_tsquery('portuguese', search_query)) as rank
  FROM public.bible_verses bv
  WHERE bv.text_search @@ plainto_tsquery('portuguese', search_query)
    AND bv.translation = translation_filter
  ORDER BY rank DESC
  LIMIT result_limit;
END;
$$;
