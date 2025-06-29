
import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  createAdminAccount: () => Promise<{ success: boolean; error?: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAdminStatus = async (userEmail: string) => {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('email')
        .eq('email', userEmail)
        .single();

      if (!error && data) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    } catch (error) {
      setIsAdmin(false);
    }
  };

  const createAdminAccount = async () => {
    try {
      console.log('Tentando criar conta admin...');
      
      // Tentar fazer signup sem confirmação de email
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: 'admin@carolynebook.com',
        password: 'linda2010',
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            email_confirm: true
          }
        }
      });

      if (signUpError) {
        console.log('Erro no signup:', signUpError);
        
        // Se o usuário já existe, tentar fazer login
        if (signUpError.message.includes('already registered') || signUpError.message.includes('User already registered')) {
          console.log('Usuário já existe, tentando login...');
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: 'admin@carolynebook.com',
            password: 'linda2010'
          });
          
          if (signInError) {
            console.log('Erro no login:', signInError);
            return { success: false, error: signInError };
          }
          
          return { success: true };
        }
        
        return { success: false, error: signUpError };
      }

      // Se o signup foi bem-sucedido, adicionar à tabela admin_users
      if (signUpData.user) {
        console.log('Conta admin criada, adicionando à tabela admin_users...');
        const { error: adminError } = await supabase
          .from('admin_users')
          .insert({
            email: 'admin@carolynebook.com'
          });
        
        if (adminError) {
          console.log('Erro ao adicionar admin_user (pode já existir):', adminError);
        }
      }

      console.log('Conta admin criada com sucesso:', signUpData);
      return { success: true };
    } catch (error) {
      console.error('Erro ao criar conta admin:', error);
      return { success: false, error };
    }
  };

  useEffect(() => {
    // Setup auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user?.email) {
          await checkAdminStatus(session.user.email);
        } else {
          setIsAdmin(false);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user?.email) {
        checkAdminStatus(session.user.email);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

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
    await supabase.auth.signOut();
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      isAdmin,
      loading,
      signIn,
      signUp,
      signOut,
      createAdminAccount,
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
