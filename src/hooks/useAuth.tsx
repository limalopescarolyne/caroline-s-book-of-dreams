
import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const checkAdminStatus = async (userEmail: string): Promise<boolean> => {
    try {
      console.log('Verificando status admin para:', userEmail);
      const { data, error } = await supabase
        .from('admin_users')
        .select('email')
        .eq('email', userEmail)
        .maybeSingle();

      if (!error && data) {
        console.log('Usuário é admin:', userEmail);
        return true;
      } else {
        console.log('Usuário não é admin:', userEmail);
        return false;
      }
    } catch (error) {
      console.error('Erro ao verificar status admin:', error);
      return false;
    }
  };

  const createFirstAdmin = async (userEmail: string): Promise<boolean> => {
    try {
      console.log('Verificando se existe admin...');
      
      const { count, error: checkError } = await supabase
        .from('admin_users')
        .select('*', { count: 'exact', head: true });

      if (checkError) {
        console.error('Erro ao verificar admins existentes:', checkError);
        return false;
      }

      if (count === 0) {
        console.log('Nenhum admin encontrado, criando primeiro admin:', userEmail);
        
        const { error: insertError } = await supabase
          .from('admin_users')
          .insert({ email: userEmail });

        if (insertError) {
          console.error('Erro ao criar admin:', insertError);
          return false;
        } else {
          console.log('Primeiro admin criado com sucesso:', userEmail);
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Erro ao criar primeiro admin:', error);
      return false;
    }
  };

  const handleAuthChange = async (session: Session | null) => {
    console.log('Auth state changed:', session?.user?.email);
    
    setSession(session);
    setUser(session?.user ?? null);
    
    if (session?.user?.email) {
      try {
        // Primeiro, tentar criar admin se for o primeiro usuário
        const wasCreatedAsAdmin = await createFirstAdmin(session.user.email);
        
        // Depois verificar se é admin
        const adminStatus = await checkAdminStatus(session.user.email);
        
        setIsAdmin(wasCreatedAsAdmin || adminStatus);
        console.log('Status admin final:', wasCreatedAsAdmin || adminStatus);
      } catch (error) {
        console.error('Erro no processo de autenticação:', error);
        setIsAdmin(false);
      }
    } else {
      setIsAdmin(false);
    }
    
    setLoading(false);
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    } catch (error) {
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });
      return { error };
    } catch (error) {
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      console.log('Iniciando logout...');
      setLoading(true);
      
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

  useEffect(() => {
    console.log('Inicializando auth state...');
    
    // Configurar listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event);
        await handleAuthChange(session);
      }
    );

    // Inicializar estado
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Erro ao obter sessão:', error);
          setLoading(false);
          return;
        }
        
        await handleAuthChange(session);
      } catch (error) {
        console.error('Erro ao inicializar auth:', error);
        setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      session,
      isAdmin,
      loading,
      signIn,
      signUp,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
