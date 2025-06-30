import React, { useState, useEffect, useCallback } from 'react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { supabase } from '@/integrations/supabase/client';
import { useSystemSettings } from '@/hooks/useSystemSettings';

interface Photo {
  id: string;
  filename: string;
  path: string;
  uploaded_at: string;
  is_visible: boolean;
  mime_type?: string;
  file_size?: number;
}

const PhotoCarousel = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const { settings } = useSystemSettings();
  const maxPhotos = settings.carouselPhotosCount || 5;

  const getImageUrl = (photo: Photo): string => {
    if (!photo?.path) {
      console.warn('Path da imagem ausente:', photo);
      return '/placeholder.svg';
    }
  
    const { data } = supabase.storage.from('photos').getPublicUrl(photo.path);
    console.log('URL da imagem:', data?.publicUrl);
    return data?.publicUrl || '/placeholder.svg';
  };

const loadPhotos = useCallback(async () => {
  setIsLoading(true);
  console.log('🔄 Carregando fotos (sem esperar sessão)...');

  try {
    const { data, error, status } = await supabase
      .from('photos')
      .select('*')
      .eq('is_visible', true)
      .order('uploaded_at', { ascending: true });

    console.log('📦 Resultado Supabase:', { status, error, data });

    if (error) {
      console.error('❌ Erro na consulta:', error);
      setPhotos([]);
    } else if (data && Array.isArray(data)) {
      setPhotos(data);
      console.log(`✅ ${data.length} fotos carregadas`);
    } else {
      console.warn('⚠️ Nenhum dado retornado');
      setPhotos([]);
    }
  } catch (err) {
    console.error('🔥 Erro inesperado:', err);
    setPhotos([]);
  } finally {
    setIsLoading(false);
  }
}, []);





  const handleIndexChange = useCallback((newIndex: number) => {
    if (newIndex >= 0 && newIndex < photos.length) {
      setCurrentIndex(newIndex);
    }
  }, [photos.length]);

  const preloadImage = useCallback((photo: Photo) => {
    if (loadedImages.has(photo.id)) return;

    const img = new Image();
    img.onload = () => {
      setLoadedImages(prev => new Set(prev).add(photo.id));
    };
    img.onerror = () => {
      console.error('Erro ao pré-carregar imagem:', photo.filename);
    };
    img.src = getImageUrl(photo);
  }, [loadedImages]);

  useEffect(() => {
    loadPhotos();
  }, [loadPhotos]);

  useEffect(() => {
    const visible = getVisiblePhotos();
    visible.forEach(({ photo }) => preloadImage(photo));
  }, [photos, currentIndex, maxPhotos, preloadImage]);

  useEffect(() => {
    const interval = setInterval(() => {
      handleIndexChange((currentIndex + 1) % photos.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [currentIndex, photos.length, handleIndexChange]);

  const getPhotoStyle = (index: number) => {
    const center = Math.floor(maxPhotos / 2);
    const distance = Math.abs(index - center);
    let transform = '';
    let zIndex = 10 - distance;
    let opacity = Math.max(0.3, 1 - distance * 0.15);
    let scale = Math.max(0.7, 1 - distance * 0.08);

    if (index < center) {
      transform = `translateX(-${distance * 70}px) rotateY(${distance * 12}deg) scale(${scale})`;
    } else if (index > center) {
      transform = `translateX(${distance * 70}px) rotateY(-${distance * 12}deg) scale(${scale})`;
    } else {
      transform = `scale(1.05)`;
      opacity = 1;
      zIndex = 20;
    }

    return { transform, zIndex, opacity, transition: 'all 0.5s ease' };
  };

  const getVisiblePhotos = () => {
    const visibleCount = Math.min(maxPhotos, photos.length);
    const visible: { photo: Photo; index: number }[] = [];

    for (let i = 0; i < visibleCount; i++) {
      const index = (currentIndex + i) % photos.length;
      visible.push({ photo: photos[index], index: i });
    }

    return visible;
  };

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="text-pink-300 animate-pulse">Carregando fotos...</div>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="text-center text-pink-300">
          Nenhuma foto disponível no momento
          <p className="text-sm text-pink-200">O administrador ainda não adicionou fotos.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-96 flex items-center justify-center overflow-hidden perspective-1000">
      <div className="relative w-full max-w-5xl mx-auto flex justify-center items-center">
        {getVisiblePhotos().map(({ photo, index }) => {
          const url = getImageUrl(photo);
          const isLoaded = loadedImages.has(photo.id);
          return (
            <div
              key={`${photo.id}-${index}`}
              className="absolute w-36 md:w-48 h-56 md:h-64 rounded-lg shadow-xl border border-white/10 overflow-hidden cursor-pointer"
              style={getPhotoStyle(index)}
              onClick={() => handleIndexChange((currentIndex + index) % photos.length)}
            >
              <AspectRatio ratio={3 / 4}>
                <img
                  src={url}
                  alt={`Foto ${index + 1}`}
                  className={`w-full h-full object-cover rounded-lg transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                  onLoad={() => setLoadedImages(prev => new Set(prev).add(photo.id))}
                  onError={(e) => {
                    console.error('Erro ao carregar imagem:', photo.filename);
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
                {!isLoaded && (
                  <div className="absolute inset-0 bg-gray-800 animate-pulse flex items-center justify-center rounded-lg">
                    <div className="text-gray-400 text-sm">Carregando...</div>
                  </div>
                )}
              </AspectRatio>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PhotoCarousel;
