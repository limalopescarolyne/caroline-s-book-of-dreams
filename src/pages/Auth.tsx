
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasAdminUser, setHasAdminUser] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  const { signIn, signUp, user, isAdmin, createAdminAccount } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (isAdmin) {
        navigate('/admin');
      } else {
        navigate('/');
      }
    }
  }, [user, isAdmin, navigate]);

  // Verificar se já existe um administrador
  useEffect(() => {
    const checkExistingAdmin = async () => {
      try {
        const { data, error } = await supabase
          .from('admin_users')
          .select('email');
        
        if (!error && data && data.length > 0) {
          setHasAdminUser(true);
        } else {
          setHasAdminUser(false);
        }
      } catch (err) {
        console.error('Erro ao verificar admin existente:', err);
        setHasAdminUser(false);
      } finally {
        setCheckingAdmin(false);
      }
    };

    checkExistingAdmin();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = isSignUp 
        ? await signUp(email, password)
        : await signIn(email, password);

      if (error) {
        setError(error.message);
      }
    } catch (err) {
      setError('Erro inesperado. Tente novamente.');
    }

    setLoading(false);
  };

  const handleCreateAdminAccount = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('Iniciando criação da conta admin...');
      const result = await createAdminAccount();
      
      if (result.success) {
        setError('');
        setHasAdminUser(true);
        console.log('Conta admin criada/configurada com sucesso');
        
        if (result.needsManualConfirmation) {
          setError('Conta admin criada! Aguarde alguns segundos e tente fazer login com: admin@admin.com / linda2010');
        } else {
          // Se criou com sucesso e fez login, a navegação será feita automaticamente pelo useEffect
        }
      } else {
        setError(result.error?.message || 'Erro ao criar/configurar conta admin');
      }
    } catch (err) {
      console.error('Erro inesperado:', err);
      setError('Erro inesperado ao criar conta admin');
    }
    
    setLoading(false);
  };

  if (checkingAdmin) {
    return (
      <div className="min-h-screen professional-dark flex items-center justify-center p-4">
        <div className="text-pink-300 text-lg animate-pulse">
          Verificando sistema...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen professional-dark flex items-center justify-center p-4">
      <Card className="w-full max-w-md glass-effect elegant-shadow border border-pink-200/30">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-serif text-white">
            {isSignUp ? 'Criar Conta' : 'Entrar'}
          </CardTitle>
          <CardDescription className="text-pink-200">
            {isSignUp 
              ? 'Crie sua conta para acessar o sistema'
              : 'Entre com suas credenciais'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-1">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/10 border-pink-300/30 text-white placeholder-gray-300"
                placeholder="seu@email.com"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-1">
                Senha
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white/10 border-pink-300/30 text-white placeholder-gray-300"
                placeholder="Sua senha"
              />
            </div>

            {error && (
              <div className="text-red-400 text-sm bg-red-900/20 p-2 rounded">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
            >
              {loading ? 'Processando...' : (isSignUp ? 'Criar Conta' : 'Entrar')}
            </Button>

            <div className="text-center space-y-2">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-pink-300 hover:text-pink-200 text-sm block w-full"
              >
                {isSignUp 
                  ? 'Já tem conta? Faça login'
                  : 'Não tem conta? Cadastre-se'
                }
              </button>
              
              {!hasAdminUser && (
                <div className="border-t border-pink-200/30 pt-4">
                  <Button
                    type="button"
                    onClick={handleCreateAdminAccount}
                    disabled={loading}
                    variant="outline"
                    className="w-full border-green-300/30 text-green-200 hover:bg-green-500/10"
                  >
                    {loading ? 'Criando...' : 'Criar Conta Admin'}
                  </Button>
                  <p className="text-xs text-gray-400 mt-1">
                    Email: admin@admin.com | Senha: linda2010
                  </p>
                  <p className="text-xs text-yellow-400 mt-1">
                    ⚠️ Este botão aparece apenas uma vez
                  </p>
                </div>
              )}
              
              {hasAdminUser && (
                <div className="border-t border-pink-200/30 pt-4">
                  <p className="text-xs text-green-400">
                    ✓ Conta de administrador já configurada
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Use: admin@admin.com | linda2010 para acessar o painel
                  </p>
                </div>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
