
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, Trash2 } from 'lucide-react';

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

interface PhotoGridProps {
  photos: Photo[];
  onToggleVisibility: (id: string, visible: boolean) => void;
  onDelete: (id: string, filename: string) => void;
}

const PhotoGrid = ({ photos, onToggleVisibility, onDelete }: PhotoGridProps) => {
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
      {photos.map((photo) => (
        <Card key={photo.id} className="glass-effect border border-pink-200/30">
          <CardContent className="p-4">
            <img
              src={photo.thumbnail_url || photo.original_url}
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
                  onClick={() => onToggleVisibility(photo.id, !photo.is_visible)}
                  className="border-blue-300/30 text-blue-200 hover:bg-blue-500/10"
                >
                  {photo.is_visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onDelete(photo.id, photo.filename)}
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
  );
};

export default PhotoGrid;
