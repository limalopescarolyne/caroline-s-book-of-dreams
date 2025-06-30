import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import PhotoUpload from '@/components/admin/PhotoUpload';
import PhotoGrid from '@/components/admin/PhotoGrid';
import MessageList from '@/components/admin/MessageList';

interface Message {
  id: string;
  name: string;
  message: string;
  created_at: string;
  is_visible: boolean;
  is_approved: boolean;
}

interface Photo {
  id: string;
  filename: string;
  original_url: string;
  thumbnail_url?: string;
  carousel_url?: string;
  uploaded_at: string;
  is_visible: boolean;
  file_size?: number;
}

const Admin = () => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar mensagens:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as mensagens",
          variant: "destructive",
        });
      } else if (data) {
        setMessages(data);
      }
    } catch (err) {
      console.error('Erro inesperado ao carregar mensagens:', err);
    }
  };

  const loadPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .order('uploaded_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar fotos:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as fotos",
          variant: "destructive",
        });
      } else if (data) {
        setPhotos(data);
      }
    } catch (err) {
      console.error('Erro inesperado ao carregar fotos:', err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([loadMessages(), loadPhotos()]);
      setLoading(false);
    };

    loadData();
  }, []);

  const approveMessage = async (id: string, approved: boolean) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_approved: approved })
        .eq('id', id);

      if (error) {
        console.error('Erro ao atualizar aprovação:', error);
        toast({
          title: "Erro",
          description: "Não foi possível atualizar a aprovação da mensagem",
          variant: "destructive",
        });
      } else {
        setMessages(prev => prev.map(msg => 
          msg.id === id ? { ...msg, is_approved: approved } : msg
        ));
        toast({
          title: "Sucesso",
          description: `Mensagem ${approved ? 'aprovada' : 'reprovada'} com sucesso`,
        });
      }
    } catch (err) {
      console.error('Erro inesperado:', err);
    }
  };

  const toggleMessageVisibility = async (id: string, visible: boolean) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_visible: visible })
        .eq('id', id);

      if (error) {
        console.error('Erro ao atualizar visibilidade:', error);
        toast({
          title: "Erro",
          description: "Não foi possível atualizar a visibilidade da mensagem",
          variant: "destructive",
        });
      } else {
        setMessages(prev => prev.map(msg => 
          msg.id === id ? { ...msg, is_visible: visible } : msg
        ));
        toast({
          title: "Sucesso",
          description: `Mensagem ${visible ? 'mostrada' : 'ocultada'} com sucesso`,
        });
      }
    } catch (err) {
      console.error('Erro inesperado:', err);
    }
  };

  const deleteMessage = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta mensagem?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao excluir mensagem:', error);
        toast({
          title: "Erro",
          description: "Não foi possível excluir a mensagem",
          variant: "destructive",
        });
      } else {
        setMessages(prev => prev.filter(msg => msg.id !== id));
        toast({
          title: "Sucesso",
          description: "Mensagem excluída com sucesso",
        });
      }
    } catch (err) {
      console.error('Erro inesperado:', err);
    }
  };

  const togglePhotoVisibility = async (id: string, visible: boolean) => {
    try {
      const { error } = await supabase
        .from('photos')
        .update({ is_visible: visible })
        .eq('id', id);

      if (error) {
        console.error('Erro ao atualizar visibilidade da foto:', error);
        toast({
          title: "Erro",
          description: "Não foi possível atualizar a visibilidade da foto",
          variant: "destructive",
        });
      } else {
        setPhotos(prev => prev.map(photo => 
          photo.id === id ? { ...photo, is_visible: visible } : photo
        ));
        toast({
          title: "Sucesso",
          description: `Foto ${visible ? 'mostrada' : 'ocultada'} com sucesso`,
        });
      }
    } catch (err) {
      console.error('Erro inesperado:', err);
    }
  };

  const deletePhoto = async (id: string, filename: string) => {
    if (!confirm('Tem certeza que deseja excluir esta foto?')) {
      return;
    }

    try {
      // Remover todas as versões do storage
      const filesToRemove = [
        `originals/${filename}`,
        `thumbnails/thumb_${filename}`,
        `carousel/carousel_${filename}`
      ];

      for (const file of filesToRemove) {
        const { error: storageError } = await supabase.storage
          .from('photos')
          .remove([file]);

        if (storageError) {
          console.error('Erro ao remover do storage:', storageError);
        }
      }

      // Remover do banco
      const { error: dbError } = await supabase
        .from('photos')
        .delete()
        .eq('id', id);

      if (dbError) {
        console.error('Erro ao excluir do banco:', dbError);
        toast({
          title: "Erro",
          description: "Não foi possível excluir a foto",
          variant: "destructive",
        });
      } else {
        setPhotos(prev => prev.filter(photo => photo.id !== id));
        toast({
          title: "Sucesso",
          description: "Foto excluída com sucesso",
        });
      }
    } catch (err) {
      console.error('Erro inesperado:', err);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen professional-dark flex items-center justify-center">
        <div className="text-pink-300 text-lg animate-pulse">
          Carregando painel administrativo...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen professional-dark p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-serif text-white mb-2">
              Painel Administrativo
            </h1>
            <p className="text-pink-200">
              Bem-vindo, {user?.email}
            </p>
          </div>
          <div className="flex gap-4">
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="border-pink-300/30 text-pink-200 hover:bg-pink-500/10"
            >
              Ver Site
            </Button>
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="border-red-300/30 text-red-200 hover:bg-red-500/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>

        <Tabs defaultValue="messages" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-gray-800/50">
            <TabsTrigger value="messages" className="data-[state=active]:bg-pink-500/20">
              Mensagens ({messages.length})
            </TabsTrigger>
            <TabsTrigger value="photos" className="data-[state=active]:bg-pink-500/20">
              Fotos ({photos.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="messages" className="space-y-4">
            <MessageList
              messages={messages}
              onApprove={approveMessage}
              onToggleVisibility={toggleMessageVisibility}
              onDelete={deleteMessage}
            />
          </TabsContent>

          <TabsContent value="photos" className="space-y-4">
            <PhotoUpload onUploadComplete={loadPhotos} />
            <PhotoGrid
              photos={photos}
              onToggleVisibility={togglePhotoVisibility}
              onDelete={deletePhoto}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
