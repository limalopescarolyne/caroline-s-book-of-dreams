
-- Adicionar colunas para armazenar os dados das imagens diretamente no banco
ALTER TABLE public.photos 
ADD COLUMN original_data BYTEA,
ADD COLUMN thumbnail_data BYTEA,
ADD COLUMN carousel_data BYTEA;

-- Adicionar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_photos_is_visible ON public.photos(is_visible);
CREATE INDEX IF NOT EXISTS idx_messages_is_approved ON public.messages(is_approved);
CREATE INDEX IF NOT EXISTS idx_messages_is_visible ON public.messages(is_visible);

-- Função para limpar dados antigos do storage (opcional)
CREATE OR REPLACE FUNCTION public.cleanup_old_photo_urls()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Remove URLs antigas quando temos dados binários
  UPDATE public.photos 
  SET original_url = NULL, thumbnail_url = NULL, medium_url = NULL
  WHERE original_data IS NOT NULL;
END;
$$;

-- Trigger para garantir que pelo menos uma forma de dados existe
CREATE OR REPLACE FUNCTION public.validate_photo_data()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.original_data IS NULL AND NEW.original_url IS NULL THEN
    RAISE EXCEPTION 'Photo must have either binary data or URL';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_photo_trigger ON public.photos;
CREATE TRIGGER validate_photo_trigger
  BEFORE INSERT OR UPDATE ON public.photos
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_photo_data();
