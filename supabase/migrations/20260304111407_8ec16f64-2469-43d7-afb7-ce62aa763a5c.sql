
CREATE TABLE public.pinned_verses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  translation text NOT NULL DEFAULT 'acf',
  book text NOT NULL,
  chapter integer NOT NULL,
  verse integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

ALTER TABLE public.pinned_verses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own pinned verse"
  ON public.pinned_verses FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pinned verse"
  ON public.pinned_verses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pinned verse"
  ON public.pinned_verses FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own pinned verse"
  ON public.pinned_verses FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER update_pinned_verses_updated_at
  BEFORE UPDATE ON public.pinned_verses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
