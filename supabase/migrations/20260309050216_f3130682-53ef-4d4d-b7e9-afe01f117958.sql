
-- Tags table
CREATE TABLE public.favorite_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  color text NOT NULL DEFAULT '#c4a882',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, name)
);

ALTER TABLE public.favorite_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tags" ON public.favorite_tags FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tags" ON public.favorite_tags FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tags" ON public.favorite_tags FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tags" ON public.favorite_tags FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Junction table
CREATE TABLE public.favorite_verse_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  favorite_id uuid NOT NULL REFERENCES public.favorite_verses(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES public.favorite_tags(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (favorite_id, tag_id)
);

ALTER TABLE public.favorite_verse_tags ENABLE ROW LEVEL SECURITY;

-- RLS via join to parent tables
CREATE POLICY "Users can view own verse tags" ON public.favorite_verse_tags FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.favorite_verses fv WHERE fv.id = favorite_id AND fv.user_id = auth.uid()));
CREATE POLICY "Users can insert own verse tags" ON public.favorite_verse_tags FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.favorite_verses fv WHERE fv.id = favorite_id AND fv.user_id = auth.uid()));
CREATE POLICY "Users can delete own verse tags" ON public.favorite_verse_tags FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.favorite_verses fv WHERE fv.id = favorite_id AND fv.user_id = auth.uid()));
