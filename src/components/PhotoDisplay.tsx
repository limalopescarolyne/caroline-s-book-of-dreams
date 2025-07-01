
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PhotoDisplayProps {
  photo: {
    id: string;
    filename: string;
    path?: string;
    original_data?: string;
    thumbnail_data?: string;
    carousel_data?: string;
    mime_type?: string;
  };
  size?: 'thumbnail' | 'carousel' | 'original';
  className?: string;
  alt?: string;
  onLoad?: () => void;
  onError?: () => void;
}

const PhotoDisplay: React.FC<PhotoDisplayProps> = ({
  photo,
  size = 'carousel',
  className = '',
  alt,
  onLoad,
  onError
}) => {
  const [imageError, setImageError] = useState(false);

  const getImageSrc = () => {
    // Se houver erro anterior, usar placeholder
    if (imageError) {
      return '/placeholder.svg';
    }

    // Priorizar dados base64 quando disponíveis
    if (size === 'thumbnail' && photo.thumbnail_data) {
      return photo.thumbnail_data;
    }
    if (size === 'carousel' && photo.carousel_data) {
      return photo.carousel_data;
    }
    if (size === 'original' && photo.original_data) {
      return photo.original_data;
    }

    // Fallback para storage path se disponível
    if (photo.path) {
      const { data } = supabase.storage.from('photos').getPublicUrl(photo.path);
      return data?.publicUrl || '/placeholder.svg';
    }

    // Último fallback
    return '/placeholder.svg';
  };

  const handleImageError = () => {
    console.error('❌ Erro ao carregar imagem:', photo.filename);
    setImageError(true);
    onError?.();
  };

  const handleImageLoad = () => {
    console.log('✅ Imagem carregada:', photo.filename);
    onLoad?.();
  };

  return (
    <img
      src={getImageSrc()}
      alt={alt || `Foto ${photo.filename}`}
      className={className}
      onLoad={handleImageLoad}
      onError={handleImageError}
    />
  );
};

export default PhotoDisplay;
