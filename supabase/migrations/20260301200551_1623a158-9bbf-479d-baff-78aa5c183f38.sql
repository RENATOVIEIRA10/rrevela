
-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create highlight color enum type
CREATE TYPE public.highlight_color AS ENUM (
  'PROMESSA',
  'RESPOSTA_HUMANA',
  'ATRIBUTOS_DE_DEUS',
  'EMOCOES_ORACAO',
  'VERDADE_DOUTRINARIA'
);

-- Create highlights table
CREATE TABLE public.highlights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book TEXT NOT NULL,
  chapter INTEGER NOT NULL,
  verse INTEGER NOT NULL,
  color_key public.highlight_color NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, book, chapter, verse)
);

ALTER TABLE public.highlights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own highlights" ON public.highlights FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own highlights" ON public.highlights FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own highlights" ON public.highlights FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own highlights" ON public.highlights FOR DELETE USING (auth.uid() = user_id);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_highlights_updated_at BEFORE UPDATE ON public.highlights FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Index for fast highlight lookups
CREATE INDEX idx_highlights_user_book_chapter ON public.highlights(user_id, book, chapter);
