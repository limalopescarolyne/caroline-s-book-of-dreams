
-- Adicionar colunas para armazenar dados das imagens em diferentes resoluções
ALTER TABLE public.photos 
ADD COLUMN original_data TEXT,
ADD COLUMN thumbnail_data TEXT,
ADD COLUMN carousel_data TEXT;

-- Atualizar a função de validação para considerar que podemos ter tanto dados binários quanto path do storage
DROP FUNCTION IF EXISTS public.validate_photo_data();

CREATE OR REPLACE FUNCTION public.validate_photo_data()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  -- Validar que a foto tem pelo menos um caminho ou dados binários
  IF (NEW.path IS NULL OR NEW.path = '') AND 
     (NEW.original_data IS NULL OR NEW.original_data = '') THEN
    RAISE EXCEPTION 'Photo must have either storage path or image data';
  END IF;
  RETURN NEW;
END;
$function$;

-- Criar trigger para validação
DROP TRIGGER IF EXISTS validate_photo_data_trigger ON public.photos;
CREATE TRIGGER validate_photo_data_trigger
  BEFORE INSERT OR UPDATE ON public.photos
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_photo_data();
