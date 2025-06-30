
-- Limpar dados existentes e recriar estrutura
DROP TABLE IF EXISTS public.admin_users CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.photos CASCADE;

-- Recriar tabela de fotos com melhor estrutura
CREATE TABLE public.photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  filename TEXT NOT NULL,
  original_data BYTEA NOT NULL,
  thumbnail_data BYTEA NOT NULL,
  carousel_data BYTEA NOT NULL,
  file_size INTEGER,
  mime_type TEXT DEFAULT 'image/jpeg',
  is_visible BOOLEAN NOT NULL DEFAULT true,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Recriar tabela de mensagens
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  message TEXT NOT NULL,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Recriar tabela de administradores
CREATE TABLE public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar índices para performance
CREATE INDEX idx_photos_is_visible ON public.photos(is_visible);
CREATE INDEX idx_photos_uploaded_at ON public.photos(uploaded_at);
CREATE INDEX idx_messages_is_visible ON public.messages(is_visible);
CREATE INDEX idx_messages_is_approved ON public.messages(is_approved);
CREATE INDEX idx_messages_created_at ON public.messages(created_at);

-- Função para validar dados das fotos
CREATE OR REPLACE FUNCTION public.validate_photo_data()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.original_data IS NULL OR NEW.thumbnail_data IS NULL OR NEW.carousel_data IS NULL THEN
    RAISE EXCEPTION 'Photo must have all image data (original, thumbnail, carousel)';
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger para validação
CREATE TRIGGER validate_photo_trigger
  BEFORE INSERT OR UPDATE ON public.photos
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_photo_data();

-- Função para criar primeiro admin automaticamente
CREATE OR REPLACE FUNCTION public.create_first_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_count INTEGER;
BEGIN
  -- Verificar se já existe algum admin
  SELECT COUNT(*) INTO admin_count FROM public.admin_users;
  
  -- Se não existe nenhum admin, criar o primeiro
  IF admin_count = 0 THEN
    INSERT INTO public.admin_users (email) VALUES (NEW.email);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger para criar primeiro admin quando usuário se cadastra
CREATE TRIGGER create_first_admin_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_first_admin();
