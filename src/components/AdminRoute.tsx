
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen professional-dark flex items-center justify-center">
        <div className="text-center">
          <div className="text-pink-300 text-lg animate-pulse mb-2">
            Verificando permissões...
          </div>
          <div className="text-gray-400 text-sm">
            Aguarde enquanto validamos suas credenciais
          </div>
        </div>
      </div>
    );
  }

  console.log('AdminRoute - user:', user?.email, 'isAdmin:', isAdmin);

  if (!user) {
    console.log('Usuário não logado, redirecionando para /auth');
    return <Navigate to="/auth" replace />;
  }

  if (!isAdmin) {
    console.log('Usuário não é admin, redirecionando para /auth');
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
