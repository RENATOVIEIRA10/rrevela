-- Adiciona colunas de preferências de leitura na tabela profiles
-- para sincronizar entre dispositivos (font_size e translation)

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS font_size text NOT NULL DEFAULT 'md',
  ADD COLUMN IF NOT EXISTS translation text NOT NULL DEFAULT 'acf';
