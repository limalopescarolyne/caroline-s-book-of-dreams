
-- Remover políticas existentes que são muito restritivas
DROP POLICY IF EXISTS "Allow SELECT for authenticated users" ON public.photos;
DROP POLICY IF EXISTS "Allow INSERT for authenticated users" ON public.photos;
DROP POLICY IF EXISTS "Allow UPDATE by owner" ON public.photos;
DROP POLICY IF EXISTS "Allow DELETE by owner" ON public.photos;

-- Criar políticas para fotos (público pode ver fotos visíveis, apenas admin pode gerenciar)
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

-- Remover políticas existentes de mensagens se existirem
DROP POLICY IF EXISTS "Anyone can insert messages" ON public.messages;
DROP POLICY IF EXISTS "Anyone can view approved messages" ON public.messages;
DROP POLICY IF EXISTS "Admin can view all messages" ON public.messages;
DROP POLICY IF EXISTS "Admin can update messages" ON public.messages;
DROP POLICY IF EXISTS "Admin can delete messages" ON public.messages;

-- Criar políticas para mensagens (qualquer um pode inserir e ver aprovadas, admin pode gerenciar)
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
