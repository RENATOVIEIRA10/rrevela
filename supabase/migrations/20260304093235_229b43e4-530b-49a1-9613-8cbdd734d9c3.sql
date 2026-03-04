
CREATE TABLE public.shared_verses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  book TEXT NOT NULL,
  chapter INTEGER NOT NULL,
  verse INTEGER NOT NULL,
  translation TEXT NOT NULL DEFAULT 'acf',
  share_text TEXT NOT NULL,
  insight_text TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.shared_verses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read shared verses" ON public.shared_verses FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert shared verses" ON public.shared_verses FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
