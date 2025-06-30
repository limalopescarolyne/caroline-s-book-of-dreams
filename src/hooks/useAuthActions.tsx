
import { supabase } from '@/integrations/supabase/client';

export const useAuthActions = () => {
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
    return { error };
  };

  const signOut = async () => {
    try {
      console.log('Iniciando logout...');
      
      // Limpar storage local
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          localStorage.removeItem(key);
        }
      });
      
      // Fazer logout no Supabase
      await supabase.auth.signOut({ scope: 'global' });
      
      console.log('Logout realizado, redirecionando...');
      
      // Forçar reload da página para garantir limpeza completa
      window.location.href = '/auth';
    } catch (error) {
      console.error('Erro durante logout:', error);
      // Mesmo com erro, tentar redirecionar
      window.location.href = '/auth';
    }
  };

  return {
    signIn,
    signUp,
    signOut
  };
};
