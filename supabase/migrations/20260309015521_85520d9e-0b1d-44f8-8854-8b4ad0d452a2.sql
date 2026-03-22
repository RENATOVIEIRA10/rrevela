
-- Table: user reading plan progress
CREATE TABLE IF NOT EXISTS public.user_reading_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  plan_id TEXT NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_days INTEGER[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, plan_id)
);

ALTER TABLE public.user_reading_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reading progress"
ON public.user_reading_progress FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reading progress"
ON public.user_reading_progress FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reading progress"
ON public.user_reading_progress FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reading progress"
ON public.user_reading_progress FOR DELETE
USING (auth.uid() = user_id);

-- Table: push subscriptions
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  endpoint TEXT NOT NULL,
  subscription JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own push subscriptions"
ON public.push_subscriptions FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Trigger for updated_at on reading progress
CREATE TRIGGER update_user_reading_progress_updated_at
BEFORE UPDATE ON public.user_reading_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
