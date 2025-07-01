
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, Trash2 } from 'lucide-react';
import { createImageUrl } from '@/utils/imageProcessing';
import { supabase } from '@/integrations/supabase/client';

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

interface PhotoGridProps {
  photos: Photo[];
  onToggleVisibility: (id: string, visible: boolean) => void;
  onDelete: (id: string) => void;
}

const PhotoGrid = ({ photos, onToggleVisibility, onDelete }: PhotoGridProps) => {
  const getImageSrc = (photo: Photo): string => {
    // Priorizar dados base64 quando disponíveis
    if (photo.thumbnail_data) {
      return createImageUrl(photo.thumbnail_data, photo.mime_type);
    }
    
    // Fallback para storage path se disponível
    if (photo.path) {
      const { data } = supabase.storage.from('photos').getPublicUrl(photo.path);
      return data?.publicUrl || '/placeholder.svg';
    }

    // Último fallback
    return '/placeholder.svg';
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '';
    
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  const handleDelete = (photo: Photo) => {
    if (confirm(`Tem certeza que deseja excluir a foto ${photo.filename}?`)) {
      onDelete(photo.id);
    }
  };

  if (photos.length === 0) {
    return (
      <Card className="glass-effect border border-pink-200/30">
        <CardContent className="text-center py-8">
          <p className="text-gray-400">Nenhuma foto encontrada</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {photos.map((photo) => {
        const imageSrc = getImageSrc(photo);
        
        return (
          <Card key={photo.id} className="glass-effect border border-pink-200/30">
            <CardContent className="p-4">
              <div className="relative">
                <img
                  src={imageSrc}
                  alt={photo.filename}
                  className="w-full h-48 object-cover rounded mb-3"
                  onError={(e) => {
                    console.error('Erro ao carregar imagem:', photo.filename);
                    e.currentTarget.src = '/placeholder.svg';
                  }}
                />
                <Badge 
                  variant="secondary" 
                  className="absolute top-2 right-2 bg-green-600 text-white"
                >
                  {photo.path && photo.thumbnail_data ? 'Storage+Base64' : photo.path ? 'Storage' : 'Base64'}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Badge variant={photo.is_visible ? "default" : "secondary"}>
                    {photo.is_visible ? "Visível" : "Oculta"}
                  </Badge>
                  <span className="text-xs text-gray-300">
                    {formatFileSize(photo.file_size)}
                  </span>
                </div>
                
                <div className="text-xs text-gray-400 truncate">
                  {photo.filename}
                </div>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onToggleVisibility(photo.id, !photo.is_visible)}
                    className="border-blue-300/30 text-blue-200 hover:bg-blue-500/10"
                    title={photo.is_visible ? "Ocultar foto" : "Mostrar foto"}
                  >
                    {photo.is_visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(photo)}
                    className="border-red-300/30 text-red-200 hover:bg-red-500/10"
                    title="Excluir foto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default PhotoGrid;
