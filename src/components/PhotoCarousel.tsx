
import React, { useState, useEffect, useCallback } from 'react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { useSystemSettings } from '@/hooks/useSystemSettings';
import { usePhotos } from '@/hooks/usePhotos';
import PhotoDisplay from './PhotoDisplay';

const PhotoCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const { settings } = useSystemSettings();
  const { photos, loading } = usePhotos();
  const maxPhotos = settings.carouselPhotosCount || 5;

  // Filtrar apenas fotos visíveis
  const visiblePhotos = photos.filter(photo => photo.is_visible);

  const handleIndexChange = useCallback((newIndex: number) => {
    if (newIndex >= 0 && newIndex < visiblePhotos.length) {
      setCurrentIndex(newIndex);
    }
  }, [visiblePhotos.length]);

  const preloadImage = useCallback((photo: any) => {
    if (loadedImages.has(photo.id)) return;

    const img = new Image();
    img.onload = () => {
      console.log('✅ Imagem pré-carregada:', photo.filename);
      setLoadedImages(prev => new Set(prev).add(photo.id));
    };
    img.onerror = () => {
      console.error('❌ Erro ao pré-carregar:', photo.filename);
    };

    // Usar dados carousel se disponível, senão usar path do storage
    if (photo.carousel_data) {
      img.src = photo.carousel_data;
    } else if (photo.path) {
      img.src = `https://ajmlcrsukpldsghxzabi.supabase.co/storage/v1/object/public/photos/${photo.path}`;
    }
  }, [loadedImages]);

  useEffect(() => {
    if (visiblePhotos.length > 0) {
      const visible = getVisiblePhotos();
      visible.forEach(({ photo }) => preloadImage(photo));
    }
  }, [visiblePhotos, currentIndex, maxPhotos, preloadImage]);

  useEffect(() => {
    if (visiblePhotos.length > 1) {
      const interval = setInterval(() => {
        handleIndexChange((currentIndex + 1) % visiblePhotos.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [currentIndex, visiblePhotos.length, handleIndexChange]);

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
    const visibleCount = Math.min(maxPhotos, visiblePhotos.length);
    const visible: { photo: any; index: number }[] = [];

    for (let i = 0; i < visibleCount; i++) {
      const index = (currentIndex + i) % visiblePhotos.length;
      visible.push({ photo: visiblePhotos[index], index: i });
    }

    return visible;
  };

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="text-pink-300 animate-pulse">Carregando fotos...</div>
      </div>
    );
  }

  if (visiblePhotos.length === 0) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="text-center text-pink-300">
          <p className="text-xl mb-2">📸 Nenhuma foto disponível</p>
          <p className="text-sm text-pink-200">
            O administrador ainda não adicionou fotos ao sistema.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-96 flex items-center justify-center overflow-hidden perspective-1000">
      <div className="relative w-full max-w-5xl mx-auto flex justify-center items-center">
        {getVisiblePhotos().map(({ photo, index }) => {
          const isLoaded = loadedImages.has(photo.id);
          
          return (
            <div
              key={`${photo.id}-${index}`}
              className="absolute w-36 md:w-48 h-56 md:h-64 rounded-lg shadow-xl border border-white/10 overflow-hidden cursor-pointer"
              style={getPhotoStyle(index)}
              onClick={() => handleIndexChange((currentIndex + index) % visiblePhotos.length)}
            >
              <AspectRatio ratio={3 / 4}>
                <PhotoDisplay
                  photo={photo}
                  size="carousel"
                  className={`w-full h-full object-cover rounded-lg transition-opacity duration-300 ${
                    isLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  onLoad={() => setLoadedImages(prev => new Set(prev).add(photo.id))}
                  onError={() => console.error('Erro ao carregar foto no carousel')}
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
      
      {/* Debug info */}
      <div className="absolute bottom-2 left-2 text-xs text-gray-500 bg-black/50 p-2 rounded">
        Fotos: {visiblePhotos.length} | Visíveis: {Math.min(maxPhotos, visiblePhotos.length)} | Atual: {currentIndex + 1}
      </div>
    </div>
  );
};

export default PhotoCarousel;
