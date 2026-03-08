
-- Devotional entries: pre-written devotional content for the journey
CREATE TABLE public.devotional_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_index INTEGER NOT NULL,
  era_key TEXT NOT NULL,
  book TEXT NOT NULL,
  chapter_start INTEGER NOT NULL DEFAULT 1,
  chapter_end INTEGER,
  verse_start INTEGER,
  verse_end INTEGER,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  gospel_revelation TEXT NOT NULL,
  christocentric_connection TEXT NOT NULL,
  reflection_questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User devotional progress: track user journey
CREATE TABLE public.user_devotional_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  devotional_id UUID NOT NULL REFERENCES public.devotional_entries(id) ON DELETE CASCADE,
  completed BOOLEAN NOT NULL DEFAULT false,
  favorited BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, devotional_id)
);

-- Enable RLS
ALTER TABLE public.devotional_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_devotional_progress ENABLE ROW LEVEL SECURITY;

-- Devotional entries are publicly readable
CREATE POLICY "Anyone can read devotional entries"
  ON public.devotional_entries FOR SELECT
  USING (true);

-- Service role can manage devotional entries
CREATE POLICY "Service role can manage devotional entries"
  ON public.devotional_entries FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- User progress policies
CREATE POLICY "Users can view own progress"
  ON public.user_devotional_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON public.user_devotional_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON public.user_devotional_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own progress"
  ON public.user_devotional_progress FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Index for fast lookups
CREATE INDEX idx_devotional_entries_order ON public.devotional_entries(order_index);
CREATE INDEX idx_user_devotional_progress_user ON public.user_devotional_progress(user_id);
