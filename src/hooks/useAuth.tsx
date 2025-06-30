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
  checkAndCreateFirstAdmin: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
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
      
      // Verificar se já existe algum admin
      const { data: existingAdmins, error: checkError } = await supabase
        .from('admin_users')
        .select('email');

      if (checkError) {
        console.error('Erro ao verificar admins existentes:', checkError);
        return;
      }

      // Se não existe nenhum admin, tornar o usuário atual admin
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

  const createAdminAccount = async () => {
    try {
      console.log('Iniciando criação da conta admin...');
      const adminEmail = 'admin@admin.com';
      const adminPassword = 'linda2010';
      
      // Verificar se já existe um admin cadastrado
      const { data: existingAdmins, error: checkAdminsError } = await supabase
        .from('admin_users')
        .select('email');

      if (!checkAdminsError && existingAdmins && existingAdmins.length > 0) {
        console.log('Já existe um administrador cadastrado');
        return { success: false, error: { message: 'Já existe um administrador cadastrado no sistema' } };
      }

      // Criar usuário usando signUp normal primeiro
      console.log('Criando usuário admin...');
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: adminEmail,
        password: adminPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (signUpError && !signUpError.message.includes('User already registered')) {
        console.log('Erro ao criar usuário:', signUpError);
        return { success: false, error: signUpError };
      }

      // Adicionar à tabela admin_users (agora permitido pela nova política RLS)
      console.log('Adicionando admin à tabela admin_users...');
      const { error: insertError } = await supabase
        .from('admin_users')
        .insert({
          email: adminEmail
        });
      
      if (insertError) {
        console.log('Erro ao adicionar admin à tabela:', insertError);
        return { success: false, error: insertError };
      }

      console.log('Admin criado com sucesso');

      // Tentar fazer login imediatamente
      console.log('Tentando fazer login automático...');
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: adminEmail,
        password: adminPassword
      });

      if (signInError) {
        console.log('Login automático falhou:', signInError);
        // Se falhar por email não confirmado, isso é esperado
        if (signInError.message.includes('Email not confirmed')) {
          return { success: true, error: { message: 'Conta admin criada! Use: admin@admin.com / linda2010 para fazer login (pode ser necessário confirmar email)' } };
        }
        return { success: false, error: signInError };
      }

      console.log('Login admin realizado com sucesso');
      return { success: true };

    } catch (error) {
      console.error('Erro ao criar conta admin:', error);
      return { success: false, error };
    }
  };

  useEffect(() => {
    let mounted = true;

    // Setup auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user?.email) {
          // Primeiro verificar se já é admin
          await checkAdminStatus(session.user.email);
          
          // Se não for admin, verificar se deve ser o primeiro admin
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

    // Check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user?.email) {
          await checkAdminStatus(session.user.email);
          // Verificar se deve ser o primeiro admin
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
      checkAndCreateFirstAdmin,
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
