import React, { useState, useEffect, useCallback } from 'react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { loadAndOptimizePhotos, createThumbnail, preloadImages } from '@/utils/imageOptimizer';

interface PhotoData {
  original: string;
  thumbnail?: string;
  isLoaded?: boolean;
}

const PhotoCarousel = () => {
  const [photos, setPhotos] = useState<PhotoData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const placeholderPhotos: PhotoData[] = [
    { original: '/placeholder.svg?height=600&width=400&text=Foto+1' },
    { original: '/placeholder.svg?height=600&width=400&text=Foto+2' },
    { original: '/placeholder.svg?height=600&width=400&text=Foto+3' },
    { original: '/placeholder.svg?height=600&width=400&text=Foto+4' },
    { original: '/placeholder.svg?height=600&width=400&text=Foto+5' },
  ];

  const loadPhotos = async () => {
    try {
      setIsLoading(true);
      setLoadingProgress(0);
      console.log('Carregando fotos otimizadas...');
      
      const photoUrls = await loadAndOptimizePhotos();
      
      if (photoUrls.length > 0) {
        const photoData = photoUrls.map(url => ({ original: url, isLoaded: false }));
        setPhotos(photoData);
        setLoadingProgress(25);
        
        // Generate thumbnails progressively
        await generateThumbnailsProgressively(photoData);
        
        // Preload first few images
        preloadImages(photoUrls, 0, 5);
        
      } else {
        console.log('Nenhuma foto encontrada, usando placeholders');
        setPhotos(placeholderPhotos);
      }
      
    } catch (error) {
      console.error('Erro ao carregar fotos:', error);
      setPhotos(placeholderPhotos);
    } finally {
      setIsLoading(false);
      setLoadingProgress(100);
    }
  };

  const generateThumbnailsProgressively = async (photoData: PhotoData[]) => {
    console.log('Gerando thumbnails progressivamente...');
    
    const totalPhotos = photoData.length;
    let processedCount = 0;
    
    // Process in batches of 3 for better performance
    const batchSize = 3;
    for (let i = 0; i < photoData.length; i += batchSize) {
      const batch = photoData.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (photo, batchIndex) => {
        try {
          const thumbnail = await createThumbnail(photo.original, 300);
          const actualIndex = i + batchIndex;
          
          setPhotos(prev => prev.map((p, idx) => 
            idx === actualIndex 
              ? { ...p, thumbnail, isLoaded: true }
              : p
          ));
          
          processedCount++;
          setLoadingProgress(25 + (processedCount / totalPhotos) * 50);
          
          return { ...photo, thumbnail, isLoaded: true };
        } catch (error) {
          console.error('Erro ao gerar thumbnail:', error);
          processedCount++;
          return { ...photo, isLoaded: true };
        }
      });
      
      await Promise.all(batchPromises);
      
      // Small delay between batches to not block UI
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    console.log('Thumbnails gerados com sucesso');
  };

  const handleIndexChange = useCallback((newIndex: number) => {
    setCurrentIndex(newIndex);
    
    // Preload surrounding images
    const photoUrls = photos.map(p => p.original);
    preloadImages(photoUrls, newIndex, 3);
  }, [photos]);

  useEffect(() => {
    loadPhotos();
  }, []);

  useEffect(() => {
    if (photos.length === 0) return;
    
    const interval = setInterval(() => {
      handleIndexChange((currentIndex + 1) % photos.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [photos.length, currentIndex, handleIndexChange]);

  const getPhotoStyle = (index: number) => {
    const totalPhotos = Math.min(photos.length, 5);
    const center = Math.floor(totalPhotos / 2);
    const distance = Math.abs(index - center);

    let transform = '';
    let zIndex = 10 - distance;
    let opacity = 1 - (distance * 0.15);
    let scale = 1 - (distance * 0.08);

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
    const visibleCount = Math.min(5, photos.length);
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
            Carregando fotos otimizadas...
          </div>
          <div className="w-64 bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-pink-400 to-purple-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${loadingProgress}%` }}
            ></div>
          </div>
          <div className="text-pink-200 text-sm mt-2">
            {Math.round(loadingProgress)}%
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-96 md:h-[500px] flex items-center justify-center overflow-hidden perspective-1000">
      <div className="relative w-full max-w-5xl mx-auto flex justify-center items-center">
        {getVisiblePhotos().map(({ photo, index }) => (
          <div
            key={`${photo.original}-${index}-${currentIndex}`}
            className="absolute w-36 md:w-48 h-56 md:h-64 rounded-lg shadow-xl border border-white/10 overflow-hidden cursor-pointer"
            style={getPhotoStyle(index)}
            onClick={() => handleIndexChange((currentIndex + index) % photos.length)}
          >
            <AspectRatio ratio={3 / 4} className="overflow-hidden rounded-lg">
              <img
                src={photo.thumbnail || photo.original}
                alt={`Foto ${index + 1}`}
                className="w-full h-full object-cover rounded-lg transition-opacity duration-300"
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (!target.src.includes('placeholder.svg')) {
                    target.src = '/placeholder.svg?height=600&width=400&text=Erro+ao+Carregar';
                  }
                }}
              />
            </AspectRatio>
            {index === Math.floor(5 / 2) && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg"></div>
            )}
          </div>
        ))}
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
          />
        ))}
      </div>

      {/* Navigation controls */}
      <button
        onClick={() => handleIndexChange((currentIndex - 1 + photos.length) % photos.length)}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full transition-all duration-300"
      >
        ←
      </button>
      
      <button
        onClick={() => handleIndexChange((currentIndex + 1) % photos.length)}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full transition-all duration-300"
      >
        →
      </button>
    </div>
  );
};

export default PhotoCarousel;
