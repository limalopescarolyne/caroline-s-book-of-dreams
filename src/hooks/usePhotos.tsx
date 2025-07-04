
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Photo {
  id: string;
  filename: string;
  path: string;
  uploaded_at: string;
  is_visible: boolean;
  file_size?: number;
  mime_type?: string;
}

export const usePhotos = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadPhotos = async () => {
    try {
      setLoading(true);
      console.log('Carregando fotos...');
      
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
        setPhotos([]);
      } else if (data) {
        console.log(`${data.length} fotos carregadas`);
        setPhotos(data);
      }
    } catch (err) {
      console.error('Erro inesperado ao carregar fotos:', err);
      setPhotos([]);
    } finally {
      setLoading(false);
    }
  };

  const uploadPhoto = async (file: File): Promise<boolean> => {
    try {
      console.log('Iniciando upload da imagem...');
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const filePath = `admin-uploads/${fileName}`;

      // Upload para o bucket Supabase
      console.log('Fazendo upload para Supabase Storage...');
      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error('Erro ao enviar para storage:', uploadError);
        return false;
      }

      console.log('Upload concluído. Inserindo metadados no banco...');

      const { error: dbError } = await supabase
        .from('photos')
        .insert({
          filename: fileName,
          path: filePath,
          file_size: file.size,
          mime_type: file.type,
          uploaded_at: new Date().toISOString(),
          is_visible: true,
        });

      if (dbError) {
        console.error('Erro ao salvar metadados no banco:', dbError);
        return false;
      }

      console.log('Upload e inserção concluídos com sucesso.');
      await loadPhotos(); // atualiza a galeria
      return true;
    } catch (error) {
      console.error('Erro geral no upload:', error);
      return false;
    }
  };

  const toggleVisibility = async (id: string, visible: boolean): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('photos')
        .update({ is_visible: visible })
        .eq('id', id);

      if (error) {
        console.error('Erro ao atualizar visibilidade:', error);
        return false;
      }

      setPhotos(prev => prev.map(photo => 
        photo.id === id ? { ...photo, is_visible: visible } : photo
      ));
      return true;
    } catch (err) {
      console.error('Erro inesperado:', err);
      return false;
    }
  };

  const deletePhoto = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('photos')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao excluir foto:', error);
        return false;
      }

      setPhotos(prev => prev.filter(photo => photo.id !== id));
      return true;
    } catch (err) {
      console.error('Erro inesperado:', err);
      return false;
    }
  };

  useEffect(() => {
    loadPhotos();
  }, []);

  return {
    photos,
    loading,
    loadPhotos,
    uploadPhoto,
    toggleVisibility,
    deletePhoto
  };
};
