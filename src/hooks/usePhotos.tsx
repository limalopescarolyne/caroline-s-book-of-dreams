
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { createThumbnail, optimizeForCarousel, blobToBase64 } from '@/utils/imageProcessing';

interface Photo {
  id: string;
  filename: string;
  path?: string;
  original_data?: string;
  thumbnail_data?: string;
  carousel_data?: string;
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
      console.log('🔄 Carregando fotos do banco...');
      
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .order('uploaded_at', { ascending: false });
      
      if (error) {
        console.error('❌ Erro ao carregar fotos:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as fotos",
          variant: "destructive",
        });
        setPhotos([]);
      } else if (data) {
        console.log(`✅ ${data.length} fotos carregadas do banco`);
        setPhotos(data);
        
        // Debug: mostrar estrutura das fotos
        data.forEach((photo, index) => {
          console.log(`Foto ${index + 1}:`, {
            id: photo.id,
            filename: photo.filename,
            hasPath: !!photo.path,
            hasOriginalData: !!photo.original_data,
            is_visible: photo.is_visible
          });
        });
      }
    } catch (err) {
      console.error('🔥 Erro inesperado ao carregar fotos:', err);
      setPhotos([]);
    } finally {
      setLoading(false);
    }
  };

  const uploadPhoto = async (file: File): Promise<boolean> => {
    try {
      console.log('📤 Iniciando upload da foto:', file.name);
      
      // Criar diferentes versões da imagem
      const originalBlob = file;
      const thumbnailBlob = await createThumbnail(file, 150, 200);
      const carouselBlob = await optimizeForCarousel(file, 400, 600);
      
      // Converter para base64
      const originalData = await blobToBase64(originalBlob);
      const thumbnailData = await blobToBase64(thumbnailBlob);
      const carouselData = await blobToBase64(carouselBlob);
      
      console.log('🔄 Salvando foto no banco...');
      
      // Salvar no banco de dados
      const { error: dbError } = await supabase
        .from('photos')
        .insert({
          filename: file.name,
          original_data: originalData,
          thumbnail_data: thumbnailData,
          carousel_data: carouselData,
          file_size: file.size,
          mime_type: file.type,
          is_visible: true,
        });

      if (dbError) {
        console.error('❌ Erro ao salvar no banco:', dbError);
        toast({
          title: "Erro",
          description: "Erro ao salvar a foto no banco de dados",
          variant: "destructive",
        });
        return false;
      }

      console.log('✅ Foto salva com sucesso!');
      toast({
        title: "Sucesso",
        description: "Foto enviada com sucesso!",
      });

      // Recarregar a lista
      await loadPhotos();
      return true;
      
    } catch (error) {
      console.error('🔥 Erro no upload:', error);
      toast({
        title: "Erro",
        description: "Erro ao fazer upload da foto",
        variant: "destructive",
      });
      return false;
    }
  };

  const toggleVisibility = async (id: string, visible: boolean): Promise<boolean> => {
    try {
      console.log(`🔄 Alterando visibilidade da foto ${id} para ${visible}`);
      
      const { error } = await supabase
        .from('photos')
        .update({ is_visible: visible })
        .eq('id', id);

      if (error) {
        console.error('❌ Erro ao atualizar visibilidade:', error);
        return false;
      }

      // Atualizar estado local
      setPhotos(prev => prev.map(photo => 
        photo.id === id ? { ...photo, is_visible: visible } : photo
      ));
      
      console.log('✅ Visibilidade atualizada com sucesso');
      return true;
    } catch (err) {
      console.error('🔥 Erro inesperado:', err);
      return false;
    }
  };

  const deletePhoto = async (id: string): Promise<boolean> => {
    try {
      console.log(`🗑️ Excluindo foto ${id}`);
      
      const { error } = await supabase
        .from('photos')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Erro ao excluir foto:', error);
        return false;
      }

      // Atualizar estado local
      setPhotos(prev => prev.filter(photo => photo.id !== id));
      console.log('✅ Foto excluída com sucesso');
      return true;
    } catch (err) {
      console.error('🔥 Erro inesperado:', err);
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
