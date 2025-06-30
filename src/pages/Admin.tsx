
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import PhotoUpload from '@/components/admin/PhotoUpload';
import PhotoGrid from '@/components/admin/PhotoGrid';
import MessageList from '@/components/admin/MessageList';
import { usePhotos } from '@/hooks/usePhotos';
import { useMessages } from '@/hooks/useMessages';

const Admin = () => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const {
    photos,
    loading: photosLoading,
    loadPhotos,
    toggleVisibility: togglePhotoVisibility,
    deletePhoto
  } = usePhotos();

  const {
    messages,
    loading: messagesLoading,
    loadMessages,
    approveMessage,
    toggleVisibility: toggleMessageVisibility,
    deleteMessage
  } = useMessages();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      toast({
        title: "Erro",
        description: "Erro ao fazer logout",
        variant: "destructive",
      });
    }
  };

  const handlePhotoToggleVisibility = async (id: string, visible: boolean) => {
    const success = await togglePhotoVisibility(id, visible);
    if (success) {
      toast({
        title: "Sucesso",
        description: `Foto ${visible ? 'mostrada' : 'ocultada'} com sucesso`,
      });
    } else {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a visibilidade da foto",
        variant: "destructive",
      });
    }
  };

  const handlePhotoDelete = async (id: string) => {
    const success = await deletePhoto(id);
    if (success) {
      toast({
        title: "Sucesso",
        description: "Foto excluída com sucesso",
      });
    } else {
      toast({
        title: "Erro",
        description: "Não foi possível excluir a foto",
        variant: "destructive",
      });
    }
  };

  const handleMessageApprove = async (id: string, approved: boolean) => {
    const success = await approveMessage(id, approved);
    if (success) {
      toast({
        title: "Sucesso",
        description: `Mensagem ${approved ? 'aprovada' : 'reprovada'} com sucesso`,
      });
    } else {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a aprovação da mensagem",
        variant: "destructive",
      });
    }
  };

  const handleMessageToggleVisibility = async (id: string, visible: boolean) => {
    const success = await toggleMessageVisibility(id, visible);
    if (success) {
      toast({
        title: "Sucesso",
        description: `Mensagem ${visible ? 'mostrada' : 'ocultada'} com sucesso`,
      });
    } else {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a visibilidade da mensagem",
        variant: "destructive",
      });
    }
  };

  const handleMessageDelete = async (id: string) => {
    const success = await deleteMessage(id);
    if (success) {
      toast({
        title: "Sucesso",
        description: "Mensagem excluída com sucesso",
      });
    } else {
      toast({
        title: "Erro",
        description: "Não foi possível excluir a mensagem",
        variant: "destructive",
      });
    }
  };

  if (photosLoading || messagesLoading) {
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
              onApprove={handleMessageApprove}
              onToggleVisibility={handleMessageToggleVisibility}
              onDelete={handleMessageDelete}
            />
          </TabsContent>

          <TabsContent value="photos" className="space-y-4">
            <PhotoUpload onUploadComplete={loadPhotos} />
            <PhotoGrid
              photos={photos}
              onToggleVisibility={handlePhotoToggleVisibility}
              onDelete={handlePhotoDelete}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
