
import React, { useState, useEffect, useCallback } from 'react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { supabase } from '@/integrations/supabase/client';
import { createImageUrl } from '@/utils/imageProcessing';
import { useSystemSettings } from '@/hooks/useSystemSettings';

interface Photo {
  id: string;
  filename: string;
  original_data: string;
  thumbnail_data: string;
  carousel_data: string;
  is_visible: boolean;
  mime_type?: string;
}

const PhotoCarousel = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [imageUrls, setImageUrls] = useState<Map<string, string>>(new Map());
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const { settings } = useSystemSettings();

  const maxPhotos = settings.carouselPhotosCount;

  const getImageSrc = useCallback((photo: Photo): string => {
    const existingUrl = imageUrls.get(photo.id);
    if (existingUrl) return existingUrl;

    try {
      const newUrl = createImageUrl(photo.carousel_data, photo.mime_type);
      
      if (newUrl.startsWith('blob:')) {
        setImageUrls(prev => new Map(prev.set(photo.id, newUrl)));
      }

      return newUrl;
    } catch (error) {
      console.error('Erro ao criar URL da imagem:', error);
      return '/placeholder.svg?height=600&width=400&text=Erro+ao+Carregar';
    }
  }, [imageUrls]);

  const loadPhotos = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('Carregando fotos para carousel...');
      
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .eq('is_visible', true)
        .order('uploaded_at', { ascending: true });
      
      if (!error && data && data.length > 0) {
        console.log(`${data.length} fotos carregadas para carousel`);
        setPhotos(data);
        
        // Limpar URLs antigas
        imageUrls.forEach(url => {
          if (url.startsWith('blob:')) {
            URL.revokeObjectURL(url);
          }
        });
        setImageUrls(new Map());
        setLoadedImages(new Set());
      } else {
        console.log('Nenhuma foto encontrada ou erro:', error);
        setPhotos([]);
      }
      
    } catch (error) {
      console.error('Erro ao carregar fotos:', error);
      setPhotos([]);
    } finally {
      setIsLoading(false);
    }
  }, [imageUrls]);

  const handleIndexChange = useCallback((newIndex: number) => {
    if (newIndex >= 0 && newIndex < photos.length) {
      setCurrentIndex(newIndex);
    }
  }, [photos.length]);

  const preloadImage = useCallback((photo: Photo) => {
    if (loadedImages.has(photo.id)) return;

    const img = new Image();
    img.onload = () => {
      setLoadedImages(prev => new Set(prev.add(photo.id)));
    };
    img.onerror = () => {
      console.error('Erro ao pré-carregar imagem:', photo.filename);
    };
    img.src = getImageSrc(photo);
  }, [getImageSrc, loadedImages]);

  useEffect(() => {
    loadPhotos();
    
    return () => {
      imageUrls.forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [loadPhotos]);

  // Pré-carregar imagens visíveis
  useEffect(() => {
    if (photos.length === 0) return;

    const visiblePhotos = getVisiblePhotos();
    visiblePhotos.forEach(({ photo }) => {
      preloadImage(photo);
    });
  }, [photos, currentIndex, maxPhotos, preloadImage]);

  // Auto-rotation
  useEffect(() => {
    if (photos.length === 0) return;
    
    const interval = setInterval(() => {
      handleIndexChange((currentIndex + 1) % photos.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [photos.length, currentIndex, handleIndexChange]);

  const getPhotoStyle = (index: number) => {
    const center = Math.floor(maxPhotos / 2);
    const distance = Math.abs(index - center);

    let transform = '';
    let zIndex = 10 - distance;
    let opacity = Math.max(0.3, 1 - (distance * 0.15));
    let scale = Math.max(0.7, 1 - (distance * 0.08));

    if (index < center) {
      transform = `translateX(-${distance * 70}px) rotateY(${distance * 12}deg) scale(${scale})`;
    } else if (index > center) {
      transform = `translateX(${distance * 70}px) rotateY(-${distance * 12}deg) scale(${scale})`;
    } else {
      transform = `scale(1.05)`;
      opacity = 1;
      zIndex = 20;
    }

    return {
      transform,
      zIndex,
      opacity,
      transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
    };
  };

  const getVisiblePhotos = () => {
    const visibleCount = Math.min(maxPhotos, photos.length);
    const visiblePhotos = [];

    for (let i = 0; i < visibleCount; i++) {
      const photoIndex = (currentIndex + i) % photos.length;
      visiblePhotos.push({
        photo: photos[photoIndex],
        index: i,
      });
    }

    return visiblePhotos;
  };

  if (isLoading) {
    return (
      <div className="relative h-96 md:h-[500px] flex items-center justify-center">
        <div className="text-center">
          <div className="text-pink-300 text-lg animate-pulse mb-4">
            Carregando fotos...
          </div>
        </div>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="relative h-96 md:h-[500px] flex items-center justify-center">
        <div className="text-center">
          <div className="text-pink-300 text-lg mb-4">
            Nenhuma foto disponível no momento
          </div>
          <p className="text-pink-200 text-sm">
            O administrador ainda não adicionou fotos à galeria
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-96 md:h-[500px] flex items-center justify-center overflow-hidden perspective-1000">
      <div className="relative w-full max-w-5xl mx-auto flex justify-center items-center">
        {getVisiblePhotos().map(({ photo, index }) => {
          const imageSrc = getImageSrc(photo);
          const isLoaded = loadedImages.has(photo.id);
          
          return (
            <div
              key={`${photo.id}-${index}-${currentIndex}`}
              className="absolute w-36 md:w-48 h-56 md:h-64 rounded-lg shadow-xl border border-white/10 overflow-hidden cursor-pointer"
              style={getPhotoStyle(index)}
              onClick={() => handleIndexChange((currentIndex + index) % photos.length)}
            >
              <AspectRatio ratio={3 / 4} className="overflow-hidden rounded-lg">
                <img
                  src={imageSrc}
                  alt={`Foto ${index + 1}`}
                  className={`w-full h-full object-cover rounded-lg transition-opacity duration-300 ${
                    isLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  loading="lazy"
                  onLoad={() => setLoadedImages(prev => new Set(prev.add(photo.id)))}
                  onError={(e) => {
                    console.error('Erro ao carregar imagem no carousel:', photo.filename);
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder.svg?height=600&width=400&text=Erro+ao+Carregar';
                  }}
                />
                {!isLoaded && (
                  <div className="absolute inset-0 bg-gray-800 animate-pulse rounded-lg flex items-center justify-center">
                    <div className="text-gray-400 text-sm">Carregando...</div>
                  </div>
                )}
              </AspectRatio>
              {index === Math.floor(maxPhotos / 2) && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg"></div>
              )}
            </div>
          );
        })}
      </div>

      {/* Navigation indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {photos.slice(0, Math.min(photos.length, 8)).map((_, index) => (
          <button
            key={index}
            onClick={() => handleIndexChange(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentIndex % Math.min(photos.length, 8)
                ? 'bg-pink-400 scale-125'
                : 'bg-white/40 hover:bg-white/60'
            }`}
            aria-label={`Ir para foto ${index + 1}`}
          />
        ))}
      </div>

      {/* Navigation controls */}
      {photos.length > 1 && (
        <>
          <button
            onClick={() => handleIndexChange((currentIndex - 1 + photos.length) % photos.length)}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full transition-all duration-300"
            aria-label="Foto anterior"
          >
            ←
          </button>
          
          <button
            onClick={() => handleIndexChange((currentIndex + 1) % photos.length)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full transition-all duration-300"
            aria-label="Próxima foto"
          >
            →
          </button>
        </>
      )}
    </div>
  );
};

export default PhotoCarousel;
