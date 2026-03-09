
CREATE TABLE public.favorite_verses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  book text NOT NULL,
  chapter integer NOT NULL,
  verse integer NOT NULL,
  translation text NOT NULL DEFAULT 'acf',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, book, chapter, verse)
);

ALTER TABLE public.favorite_verses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own favorites" ON public.favorite_verses FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own favorites" ON public.favorite_verses FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own favorites" ON public.favorite_verses FOR DELETE TO authenticated USING (auth.uid() = user_id);
