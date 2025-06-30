
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const { signIn, signUp, user, isAdmin } = useAuth();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const { error } = isSignUp 
        ? await signUp(email, password)
        : await signIn(email, password);

      if (error) {
        setError(error.message);
      } else if (isSignUp) {
        setSuccessMessage('Conta criada! Verifique seu email para confirmar.');
      }
    } catch (err) {
      setError('Erro inesperado. Tente novamente.');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen professional-dark flex items-center justify-center p-4">
      <Card className="w-full max-w-md glass-effect elegant-shadow border border-pink-200/30">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-serif text-white">
            {isSignUp ? 'Criar Conta' : 'Entrar'}
          </CardTitle>
          <CardDescription className="text-pink-200">
            {isSignUp 
              ? 'Crie sua conta para acessar o sistema. O primeiro usuário será automaticamente administrador.'
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

            {successMessage && (
              <div className="text-green-400 text-sm bg-green-900/20 p-2 rounded">
                {successMessage}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
            >
              {loading ? 'Processando...' : (isSignUp ? 'Criar Conta' : 'Entrar')}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-pink-300 hover:text-pink-200 text-sm"
              >
                {isSignUp 
                  ? 'Já tem conta? Faça login'
                  : 'Não tem conta? Cadastre-se'
                }
              </button>
            </div>

            {isSignUp && (
              <div className="text-center border-t border-pink-200/30 pt-4">
                <p className="text-xs text-yellow-400">
                  ℹ️ O primeiro usuário a se cadastrar será automaticamente administrador
                </p>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
