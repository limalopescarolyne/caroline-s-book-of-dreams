import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Trash2, Eye, EyeOff, Check, X, Upload, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
  const [messages, setMessages] = useState<Message[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const loadMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setMessages(data);
    }
  };

  const loadPhotos = async () => {
    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .order('uploaded_at', { ascending: false });

    if (!error && data) {
      setPhotos(data);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([loadMessages(), loadPhotos()]);
      setLoading(false);
    };

    loadData();
  }, []);

  const approveMessage = async (id: string, approved: boolean) => {
    const { error } = await supabase
      .from('messages')
      .update({ is_approved: approved })
      .eq('id', id);

    if (!error) {
      setMessages(prev => prev.map(msg => 
        msg.id === id ? { ...msg, is_approved: approved } : msg
      ));
    }
  };

  const toggleMessageVisibility = async (id: string, visible: boolean) => {
    const { error } = await supabase
      .from('messages')
      .update({ is_visible: visible })
      .eq('id', id);

    if (!error) {
      setMessages(prev => prev.map(msg => 
        msg.id === id ? { ...msg, is_visible: visible } : msg
      ));
    }
  };

  const deleteMessage = async (id: string) => {
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', id);

    if (!error) {
      setMessages(prev => prev.filter(msg => msg.id !== id));
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setUploading(true);

    for (const file of Array.from(files)) {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('photos')
          .upload(fileName, file);

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('photos')
            .getPublicUrl(fileName);

          await supabase
            .from('photos')
            .insert({
              filename: fileName,
              original_url: publicUrl,
              file_size: file.size,
              mime_type: file.type
            });
        }
      } catch (error) {
        console.error('Erro no upload:', error);
      }
    }

    setUploading(false);
    loadPhotos();
  };

  const togglePhotoVisibility = async (id: string, visible: boolean) => {
    const { error } = await supabase
      .from('photos')
      .update({ is_visible: visible })
      .eq('id', id);

    if (!error) {
      setPhotos(prev => prev.map(photo => 
        photo.id === id ? { ...photo, is_visible: visible } : photo
      ));
    }
  };

  const deletePhoto = async (id: string, filename: string) => {
    await supabase.storage
      .from('photos')
      .remove([filename]);

    const { error } = await supabase
      .from('photos')
      .delete()
      .eq('id', id);

    if (!error) {
      setPhotos(prev => prev.filter(photo => photo.id !== id));
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
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
            {messages.map((message) => (
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
            ))}
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {photos.map((photo) => (
                <Card key={photo.id} className="glass-effect border border-pink-200/30">
                  <CardContent className="p-4">
                    <img
                      src={photo.original_url}
                      alt={photo.filename}
                      className="w-full h-48 object-cover rounded mb-3"
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
