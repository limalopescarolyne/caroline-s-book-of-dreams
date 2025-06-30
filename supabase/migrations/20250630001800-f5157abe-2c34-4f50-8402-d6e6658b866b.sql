
-- Fix RLS policies for admin_users table to allow admin creation
DROP POLICY IF EXISTS "Admin can view admin_users" ON public.admin_users;

-- Create policy to allow anyone to insert the first admin user (when table is empty)
CREATE POLICY "Allow first admin creation" 
  ON public.admin_users 
  FOR INSERT 
  WITH CHECK (
    NOT EXISTS (SELECT 1 FROM public.admin_users)
  );

-- Create policy to allow existing admins to view admin_users
CREATE POLICY "Admin can view admin_users" 
  ON public.admin_users 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE email = (auth.jwt() ->> 'email')
    )
  );
