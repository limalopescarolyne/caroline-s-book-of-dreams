
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogIn, Settings, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const AuthButton = () => {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  if (!user) {
    return (
      <Button
        onClick={() => navigate('/auth')}
        variant="outline"
        className="border-pink-300/30 text-pink-200 hover:bg-pink-500/10"
        size="sm"
      >
        <LogIn className="w-4 h-4 mr-2" />
        Login
      </Button>
    );
  }

  if (isAdmin) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            size="sm"
          >
            <Settings className="w-4 h-4 mr-2" />
            Admin
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="w-56 bg-gray-900/95 border-pink-300/30 text-white"
        >
          <DropdownMenuItem 
            onClick={() => navigate('/admin')}
            className="hover:bg-pink-500/20 focus:bg-pink-500/20"
          >
            <Settings className="w-4 h-4 mr-2" />
            Painel Admin
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-pink-300/30" />
          <DropdownMenuItem 
            onClick={handleSignOut}
            className="hover:bg-red-500/20 focus:bg-red-500/20 text-red-300"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button
      onClick={handleSignOut}
      variant="outline"
      className="border-red-300/30 text-red-200 hover:bg-red-500/10"
      size="sm"
    >
      <LogOut className="w-4 h-4 mr-2" />
      Sair
    </Button>
  );
};

export default AuthButton;
