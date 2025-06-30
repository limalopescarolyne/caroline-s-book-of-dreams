
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { createThumbnail, optimizeForCarousel } from '@/utils/imageProcessing';

interface PhotoUploadProps {
  onUploadComplete: () => void;
}

const PhotoUpload = ({ onUploadComplete }: PhotoUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
        
        // Criar thumbnail
        const thumbnailBlob = await createThumbnail(file);
        const thumbnailFileName = `thumb_${fileName}`;
        
        // Otimizar para carousel
        const carouselBlob = await optimizeForCarousel(file);
        const carouselFileName = `carousel_${fileName}`;
        
        // Upload da imagem original
        const { error: originalError } = await supabase.storage
          .from('photos')
          .upload(`originals/${fileName}`, file);

        if (originalError) {
          console.error('Erro no upload original:', originalError);
          continue;
        }

        // Upload do thumbnail
        const { error: thumbError } = await supabase.storage
          .from('photos')
          .upload(`thumbnails/${thumbnailFileName}`, thumbnailBlob!);

        if (thumbError) {
          console.error('Erro no upload thumbnail:', thumbError);
        }

        // Upload da versão carousel
        const { error: carouselError } = await supabase.storage
          .from('photos')
          .upload(`carousel/${carouselFileName}`, carouselBlob!);

        if (carouselError) {
          console.error('Erro no upload carousel:', carouselError);
        }

        // URLs públicas
        const { data: { publicUrl: originalUrl } } = supabase.storage
          .from('photos')
          .getPublicUrl(`originals/${fileName}`);

        const { data: { publicUrl: thumbnailUrl } } = supabase.storage
          .from('photos')
          .getPublicUrl(`thumbnails/${thumbnailFileName}`);

        const { data: { publicUrl: carouselUrl } } = supabase.storage
          .from('photos')
          .getPublicUrl(`carousel/${carouselFileName}`);

        // Inserir registro na tabela
        const { error: insertError } = await supabase
          .from('photos')
          .insert({
            filename: fileName,
            original_url: originalUrl,
            thumbnail_url: thumbnailUrl,
            carousel_url: carouselUrl,
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
      
      onUploadComplete();
    } catch (error) {
      console.error('Erro geral no upload:', error);
      toast({
        title: "Erro",
        description: "Erro geral durante o upload",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <Card className="glass-effect border border-pink-200/30">
      <CardHeader>
        <CardTitle className="text-white">Upload de Fotos</CardTitle>
        <CardDescription className="text-pink-200">
          Selecione múltiplas fotos. O sistema criará automaticamente versões otimizadas.
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
              Processando e fazendo upload...
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PhotoUpload;
