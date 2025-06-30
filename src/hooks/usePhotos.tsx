
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { createThumbnail, optimizeForCarousel, blobToBase64 } from '@/utils/imageProcessing';

interface Photo {
  id: string;
  filename: string;
  original_data: string;
  thumbnail_data: string;
  carousel_data: string;
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
      console.log(`Processando ${file.name}...`);
      
      // Processar múltiplas resoluções da imagem
      const [originalBlob, thumbnailBlob, carouselBlob] = await Promise.all([
        Promise.resolve(file),
        createThumbnail(file),
        optimizeForCarousel(file)
      ]);

      // Converter todas para base64
      const [originalBase64, thumbnailBase64, carouselBase64] = await Promise.all([
        blobToBase64(originalBlob),
        blobToBase64(thumbnailBlob),
        blobToBase64(carouselBlob)
      ]);

      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.jpg`;

      // Inserir no banco
      const { error } = await supabase
        .from('photos')
        .insert({
          filename: fileName,
          original_data: originalBase64,
          thumbnail_data: thumbnailBase64,
          carousel_data: carouselBase64,
          file_size: file.size,
          mime_type: file.type
        });

      if (error) {
        console.error('Erro ao inserir foto:', error);
        return false;
      }

      console.log(`Foto ${file.name} processada com sucesso`);
      return true;
    } catch (error) {
      console.error('Erro ao processar foto:', error);
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
