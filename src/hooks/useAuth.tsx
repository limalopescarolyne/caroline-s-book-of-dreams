
import { useState, useEffect, createContext, useContext, useCallback } from 'react';
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

  const checkAdminStatus = useCallback(async (userEmail: string): Promise<boolean> => {
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
      }
      
      console.log('Usuário não é admin:', userEmail);
      return false;
    } catch (error) {
      console.error('Erro ao verificar status admin:', error);
      return false;
    }
  }, []);

  const handleAuthChange = useCallback(async (session: Session | null) => {
    console.log('Auth state changed:', session?.user?.email);
    
    setSession(session);
    setUser(session?.user ?? null);
    
    if (session?.user?.email) {
      const adminStatus = await checkAdminStatus(session.user.email);
      setIsAdmin(adminStatus);
      console.log('Status admin final:', adminStatus);
    } else {
      setIsAdmin(false);
    }
    
    setLoading(false);
  }, [checkAdminStatus]);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // Limpar estado anterior
      localStorage.clear();
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (!error) {
        toast({
          title: "Login realizado",
          description: "Bem-vindo de volta!",
        });
      }
      
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
      
      // Verificar se já existe um admin
      const { data: adminUsers } = await supabase
        .from('admin_users')
        .select('id', { count: 'exact' });

      if (adminUsers && adminUsers.length > 0) {
        return { 
          error: { 
            message: 'Sistema já possui um administrador. Apenas um usuário pode se cadastrar.' 
          } 
        };
      }

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

  const signOut = useCallback(async () => {
    try {
      console.log('Iniciando logout...');
      setLoading(true);
      
      // Limpar localStorage
      localStorage.clear();
      
      // Fazer logout no Supabase
      await supabase.auth.signOut({ scope: 'global' });
      
      // Limpar estado local
      setUser(null);
      setSession(null);
      setIsAdmin(false);
      
      console.log('Logout realizado com sucesso');
      
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso",
      });
      
      // Pequeno delay antes do redirecionamento
      setTimeout(() => {
        window.location.href = '/';
      }, 500);
      
    } catch (error) {
      console.error('Erro durante logout:', error);
      // Mesmo com erro, limpar estado e redirecionar
      setUser(null);
      setSession(null);
      setIsAdmin(false);
      localStorage.clear();
      window.location.href = '/';
    } finally {
      setLoading(false);
    }
  }, [toast]);

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
  }, [handleAuthChange]);

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
