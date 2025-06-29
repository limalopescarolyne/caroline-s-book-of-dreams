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
      console.log('Criando conta admin...');
      
      // Primeiro, verificar se o admin já existe na tabela admin_users
      const { data: existingAdmin, error: checkError } = await supabase
        .from('admin_users')
        .select('email')
        .eq('email', 'admin@carolynebook.com')
        .single();

      // Se não existe na tabela admin_users, adicionar
      if (checkError && checkError.code === 'PGRST116') {
        console.log('Adicionando admin à tabela admin_users...');
        const { error: insertError } = await supabase
          .from('admin_users')
          .insert({
            email: 'admin@carolynebook.com'
          });
        
        if (insertError) {
          console.log('Erro ao adicionar admin:', insertError);
        } else {
          console.log('Admin adicionado à tabela com sucesso');
        }
      }

      // Tentar fazer login direto (assumindo que o usuário já existe no auth.users)
      console.log('Tentando login com credenciais admin...');
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: 'admin@carolynebook.com',
        password: 'linda2010'
      });

      if (!signInError && signInData.user) {
        console.log('Login admin realizado com sucesso');
        return { success: true };
      }

      // Se o login falhou, tentar criar o usuário através do signup
      console.log('Usuário não existe, tentando criar via signup...');
      const { data: signUpData, error: signUpError } = await supabase.auth.admin.createUser({
        email: 'admin@carolynebook.com',
        password: 'linda2010',
        email_confirm: true,
        user_metadata: {
          role: 'admin'
        }
      });

      if (signUpError) {
        console.log('Erro no signup:', signUpError);
        
        // Como último recurso, tentar signup normal
        const { data: normalSignUp, error: normalSignUpError } = await supabase.auth.signUp({
          email: 'admin@carolynebook.com',
          password: 'linda2010'
        });

        if (normalSignUpError) {
          console.log('Erro no signup normal:', normalSignUpError);
          return { success: false, error: normalSignUpError };
        }
        
        if (normalSignUp.user) {
          console.log('Usuário criado via signup normal');
          return { success: true };
        }
      } else {
        console.log('Usuário criado via admin.createUser');
        
        // Fazer login após criar
        const { error: loginAfterCreateError } = await supabase.auth.signInWithPassword({
          email: 'admin@carolynebook.com',
          password: 'linda2010'
        });
        
        if (!loginAfterCreateError) {
          return { success: true };
        }
      }

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
