
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { usePhotos } from '@/hooks/usePhotos';

interface PhotoUploadProps {
  onUploadComplete: () => void;
}

const PhotoUpload = ({ onUploadComplete }: PhotoUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState('');
  const { toast } = useToast();
  const { uploadPhoto } = usePhotos();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setProgress('Iniciando upload...');

    try {
      const fileArray = Array.from(files);
      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        setProgress(`Processando ${i + 1}/${fileArray.length}: ${file.name}`);
        
        // Validar arquivo
        if (!file.type.startsWith('image/')) {
          console.warn(`Arquivo ${file.name} não é uma imagem válida`);
          errorCount++;
          continue;
        }

        if (file.size > 50 * 1024 * 1024) { // 50MB limite
          console.warn(`Arquivo ${file.name} é muito grande (máximo 50MB)`);
          errorCount++;
          continue;
        }

        const success = await uploadPhoto(file);
        if (success) {
          successCount++;
        } else {
          errorCount++;
        }
      }

      if (successCount > 0) {
        toast({
          title: "Upload concluído",
          description: `${successCount} foto(s) processada(s) com sucesso${errorCount > 0 ? `, ${errorCount} erro(s)` : ''}`,
        });
        onUploadComplete();
      } else {
        toast({
          title: "Erro no upload",
          description: "Nenhuma foto foi processada com sucesso",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro geral no upload:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado durante o upload",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setProgress('');
      e.target.value = '';
    }
  };

  return (
    <Card className="glass-effect border border-pink-200/30">
      <CardHeader>
        <CardTitle className="text-white">Upload de Fotos</CardTitle>
        <CardDescription className="text-pink-200">
          Selecione múltiplas fotos (máximo 50MB cada). Elas serão otimizadas automaticamente em 3 resoluções.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              className="text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"
              disabled={uploading}
            />
          </div>
          {uploading && (
            <div className="text-pink-300 animate-pulse">
              {progress}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PhotoUpload;
