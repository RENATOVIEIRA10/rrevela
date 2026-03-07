
CREATE TABLE public.shared_studies (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid,
  book text NOT NULL,
  chapter integer NOT NULL,
  verse integer,
  mode text NOT NULL DEFAULT 'essencial',
  share_type text NOT NULL DEFAULT 'study',
  share_text text NOT NULL,
  insight_text text NOT NULL DEFAULT '',
  title text NOT NULL DEFAULT '',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.shared_studies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read shared studies"
ON public.shared_studies FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can insert shared studies"
ON public.shared_studies FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
