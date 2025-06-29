
-- Criar tabela para mensagens dos usuários
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_visible BOOLEAN NOT NULL DEFAULT true,
  is_approved BOOLEAN NOT NULL DEFAULT false
);

-- Criar tabela para fotos
CREATE TABLE public.photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  filename TEXT NOT NULL,
  original_url TEXT NOT NULL,
  thumbnail_url TEXT,
  medium_url TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_visible BOOLEAN NOT NULL DEFAULT true,
  file_size INTEGER,
  mime_type TEXT
);

-- Criar tabela para usuários administrativos
CREATE TABLE public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Políticas para mensagens (público pode inserir, admin pode ver tudo)
CREATE POLICY "Anyone can insert messages" 
  ON public.messages 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Anyone can view approved messages" 
  ON public.messages 
  FOR SELECT 
  USING (is_approved = true AND is_visible = true);

CREATE POLICY "Admin can view all messages" 
  ON public.messages 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE email = (auth.jwt() ->> 'email')
    )
  );

CREATE POLICY "Admin can update messages" 
  ON public.messages 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE email = (auth.jwt() ->> 'email')
    )
  );

CREATE POLICY "Admin can delete messages" 
  ON public.messages 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE email = (auth.jwt() ->> 'email')
    )
  );

-- Políticas para fotos (público pode ver, admin pode gerenciar)
CREATE POLICY "Anyone can view visible photos" 
  ON public.photos 
  FOR SELECT 
  USING (is_visible = true);

CREATE POLICY "Admin can manage photos" 
  ON public.photos 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE email = (auth.jwt() ->> 'email')
    )
  );

-- Políticas para admin_users (apenas admin pode ver)
CREATE POLICY "Admin can view admin_users" 
  ON public.admin_users 
  FOR SELECT 
  USING (
    email = (auth.jwt() ->> 'email')
  );

-- Inserir usuário admin padrão (você pode alterar o email)
INSERT INTO public.admin_users (email) VALUES ('admin@carolynebook.com');

-- Criar bucket de storage para fotos
INSERT INTO storage.buckets (id, name, public) VALUES ('photos', 'photos', true);

-- Políticas de storage para fotos
CREATE POLICY "Anyone can view photos" 
  ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'photos');

CREATE POLICY "Admin can upload photos" 
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (
    bucket_id = 'photos' AND 
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE email = (auth.jwt() ->> 'email')
    )
  );

CREATE POLICY "Admin can update photos" 
  ON storage.objects 
  FOR UPDATE 
  USING (
    bucket_id = 'photos' AND 
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE email = (auth.jwt() ->> 'email')
    )
  );

CREATE POLICY "Admin can delete photos" 
  ON storage.objects 
  FOR DELETE 
  USING (
    bucket_id = 'photos' AND 
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE email = (auth.jwt() ->> 'email')
    )
  );
