
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Trash2, Eye, EyeOff, Check, X, Upload, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

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
  const [uploading, setUploading] = useState(false);

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
        
        // Upload do arquivo
        const { error: uploadError } = await supabase.storage
          .from('photos')
          .upload(fileName, file);

        if (uploadError) {
          console.error('Erro no upload:', uploadError);
          toast({
            title: "Erro no upload",
            description: `Erro ao fazer upload de ${file.name}`,
            variant: "destructive",
          });
          continue;
        }

        // Obter URL pública
        const { data: { publicUrl } } = supabase.storage
          .from('photos')
          .getPublicUrl(fileName);

        // Inserir registro na tabela
        const { error: insertError } = await supabase
          .from('photos')
          .insert({
            filename: fileName,
            original_url: publicUrl,
            file_size: file.size,
            mime_type: file.type
          });

        if (insertError) {
          console.error('Erro ao inserir registro:', insertError);
          toast({
            title: "Erro",
            description: `Erro ao registrar ${file.name} no banco`,
            variant: "destructive",
          });
        }
      }

      toast({
        title: "Sucesso",
        description: "Upload concluído com sucesso",
      });
      
      // Recarregar fotos
      await loadPhotos();
    } catch (error) {
      console.error('Erro geral no upload:', error);
      toast({
        title: "Erro",
        description: "Erro geral durante o upload",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      // Limpar o input
      e.target.value = '';
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
      // Remover do storage
      const { error: storageError } = await supabase.storage
        .from('photos')
        .remove([filename]);

      if (storageError) {
        console.error('Erro ao remover do storage:', storageError);
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
      navigate('/auth');
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
            {messages.length === 0 ? (
              <Card className="glass-effect border border-pink-200/30">
                <CardContent className="text-center py-8">
                  <p className="text-gray-400">Nenhuma mensagem encontrada</p>
                </CardContent>
              </Card>
            ) : (
              messages.map((message) => (
                <Card key={message.id} className="glass-effect border border-pink-200/30">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg text-white">{message.name}</CardTitle>
                        <CardDescription className="text-pink-200">
                          {new Date(message.created_at).toLocaleString('pt-BR')}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={message.is_approved ? "default" : "secondary"}>
                          {message.is_approved ? "Aprovada" : "Pendente"}
                        </Badge>
                        <Badge variant={message.is_visible ? "default" : "secondary"}>
                          {message.is_visible ? "Visível" : "Oculta"}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-200 mb-4">{message.message}</p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => approveMessage(message.id, !message.is_approved)}
                        className={message.is_approved 
                          ? "bg-orange-500 hover:bg-orange-600" 
                          : "bg-green-500 hover:bg-green-600"
                        }
                      >
                        {message.is_approved ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                        {message.is_approved ? "Reprovar" : "Aprovar"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleMessageVisibility(message.id, !message.is_visible)}
                        className="border-blue-300/30 text-blue-200 hover:bg-blue-500/10"
                      >
                        {message.is_visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        {message.is_visible ? "Ocultar" : "Mostrar"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteMessage(message.id)}
                        className="border-red-300/30 text-red-200 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                        Excluir
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="photos" className="space-y-4">
            <Card className="glass-effect border border-pink-200/30">
              <CardHeader>
                <CardTitle className="text-white">Upload de Fotos</CardTitle>
                <CardDescription className="text-pink-200">
                  Selecione múltiplas fotos para fazer upload
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="text-white"
                    disabled={uploading}
                  />
                  {uploading && (
                    <div className="text-pink-300 animate-pulse">
                      Fazendo upload...
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {photos.length === 0 ? (
              <Card className="glass-effect border border-pink-200/30">
                <CardContent className="text-center py-8">
                  <p className="text-gray-400">Nenhuma foto encontrada</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {photos.map((photo) => (
                  <Card key={photo.id} className="glass-effect border border-pink-200/30">
                    <CardContent className="p-4">
                      <img
                        src={photo.original_url}
                        alt={photo.filename}
                        className="w-full h-48 object-cover rounded mb-3"
                        onError={(e) => {
                          console.error('Erro ao carregar imagem:', photo.original_url);
                          e.currentTarget.src = '/placeholder.svg';
                        }}
                      />
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Badge variant={photo.is_visible ? "default" : "secondary"}>
                            {photo.is_visible ? "Visível" : "Oculta"}
                          </Badge>
                          <span className="text-xs text-gray-300">
                            {photo.file_size ? `${(photo.file_size / 1024).toFixed(1)}KB` : ''}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => togglePhotoVisibility(photo.id, !photo.is_visible)}
                            className="border-blue-300/30 text-blue-200 hover:bg-blue-500/10"
                          >
                            {photo.is_visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deletePhoto(photo.id, photo.filename)}
                            className="border-red-300/30 text-red-200 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
