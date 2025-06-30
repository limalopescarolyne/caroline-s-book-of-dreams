
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAdminStatus = async (userEmail: string) => {
    try {
      console.log('Verificando status admin para:', userEmail);
      const { data, error } = await supabase
        .from('admin_users')
        .select('email')
        .eq('email', userEmail)
        .single();

      if (!error && data) {
        console.log('Usuário é admin:', userEmail);
        setIsAdmin(true);
      } else {
        console.log('Usuário não é admin:', userEmail, error);
        setIsAdmin(false);
      }
    } catch (error) {
      console.log('Erro ao verificar status admin:', error);
      setIsAdmin(false);
    }
  };

  const checkAndCreateFirstAdmin = async () => {
    if (!user?.email) return;

    try {
      console.log('Verificando se existe admin...');
      
      const { data: existingAdmins, error: checkError } = await supabase
        .from('admin_users')
        .select('email');

      if (checkError) {
        console.error('Erro ao verificar admins existentes:', checkError);
        return;
      }

      if (!existingAdmins || existingAdmins.length === 0) {
        console.log('Nenhum admin encontrado, tornando usuário atual admin:', user.email);
        
        const { error: insertError } = await supabase
          .from('admin_users')
          .insert({ email: user.email });

        if (insertError) {
          console.error('Erro ao criar admin:', insertError);
        } else {
          console.log('Admin criado com sucesso:', user.email);
          setIsAdmin(true);
        }
      } else {
        console.log('Já existem admins cadastrados:', existingAdmins.length);
      }
    } catch (error) {
      console.error('Erro ao verificar/criar primeiro admin:', error);
    }
  };

  useEffect(() => {
    let mounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user?.email) {
          await checkAdminStatus(session.user.email);
          
          setTimeout(async () => {
            if (mounted) {
              await checkAndCreateFirstAdmin();
            }
          }, 1000);
        } else {
          setIsAdmin(false);
        }
        
        setLoading(false);
      }
    );

    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user?.email) {
          await checkAdminStatus(session.user.email);
          setTimeout(async () => {
            if (mounted) {
              await checkAndCreateFirstAdmin();
            }
          }, 1000);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Erro ao inicializar auth:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [user?.email]);

  return {
    user,
    session,
    isAdmin,
    loading,
    checkAdminStatus,
    checkAndCreateFirstAdmin
  };
};
