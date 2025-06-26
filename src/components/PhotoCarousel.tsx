
import React, { useState, useEffect } from 'react';
import { AspectRatio } from '@/components/ui/aspect-ratio';

const PhotoCarousel = () => {
  const [photos, setPhotos] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const placeholderPhotos = [
    '/placeholder.svg?height=600&width=400&text=Foto+1',
    '/placeholder.svg?height=600&width=400&text=Foto+2',
    '/placeholder.svg?height=600&width=400&text=Foto+3',
    '/placeholder.svg?height=600&width=400&text=Foto+4',
    '/placeholder.svg?height=600&width=400&text=Foto+5',
    '/placeholder.svg?height=600&width=400&text=Foto+6',
    '/placeholder.svg?height=600&width=400&text=Foto+7',
    '/placeholder.svg?height=600&width=400&text=Foto+8',
  ];

  const loadPhotos = async () => {
    try {
      setIsLoading(true);
      console.log('Iniciando carregamento de fotos...');
      
      const photoUrls: string[] = [];
      const extensions = ['jpeg', 'jpg', 'png', 'webp'];
      
      // Carrega apenas as primeiras 20 fotos para melhorar performance
      for (let i = 1; i <= 20; i++) {
        let photoFound = false;
        
        for (const ext of extensions) {
          const photoUrl = `/photos/foto (${i}).${ext}`;
          
          try {
            // Verifica se a foto existe
            const img = new Image();
            img.src = photoUrl;
            
            await new Promise((resolve, reject) => {
              img.onload = () => {
                photoUrls.push(photoUrl);
                photoFound = true;
                console.log(`Foto carregada: ${photoUrl}`);
                resolve(photoUrl);
              };
              img.onerror = () => reject();
              
              // Timeout para evitar espera excessiva
              setTimeout(() => reject(), 1000);
            });
            
            if (photoFound) break;
          } catch (error) {
            continue;
          }
        }
      }
      
      console.log(`Total de fotos carregadas: ${photoUrls.length}`);
      
      if (photoUrls.length > 0) {
        setPhotos(photoUrls);
      } else {
        console.log('Nenhuma foto encontrada, usando placeholders');
        setPhotos(placeholderPhotos);
      }
      
    } catch (error) {
      console.error('Erro ao carregar fotos:', error);
      setPhotos(placeholderPhotos);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPhotos();
  }, []);

  useEffect(() => {
    if (photos.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % photos.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [photos.length]);

  const getPhotoStyle = (index: number) => {
    const totalPhotos = Math.min(photos.length, 5); // Reduzido para 5 fotos visíveis
    const center = Math.floor(totalPhotos / 2);
    const distance = Math.abs(index - center);

    let transform = '';
    let zIndex = 10 - distance;
    let opacity = 1 - (distance * 0.2);
    let blur = distance * 2;
    let scale = 1 - (distance * 0.1);

    if (index < center) {
      transform = `translateX(-${distance * 80}px) rotateY(${distance * 15}deg) scale(${scale})`;
    } else if (index > center) {
      transform = `translateX(${distance * 80}px) rotateY(-${distance * 15}deg) scale(${scale})`;
    } else {
      transform = `scale(1.1)`;
      opacity = 1;
      blur = 0;
      zIndex = 20;
    }

    return {
      transform,
      zIndex,
      opacity,
      filter: `blur(${blur}px)`,
      transition: 'all 0.6s ease-in-out',
    };
  };

  const getVisiblePhotos = () => {
    const visibleCount = 5; // Reduzido para melhor performance
    const visiblePhotos = [];

    for (let i = 0; i < visibleCount && i < photos.length; i++) {
      const photoIndex = (currentIndex + i) % photos.length;
      visiblePhotos.push({
        src: photos[photoIndex],
        index: i,
      });
    }

    return visiblePhotos;
  };

  if (isLoading) {
    return (
      <div className="relative h-96 md:h-[500px] flex items-center justify-center">
        <div className="text-pink-300 text-lg">Carregando fotos...</div>
      </div>
    );
  }

  return (
    <div className="relative h-96 md:h-[500px] flex items-center justify-center overflow-hidden perspective-1000">
      <div className="relative w-full max-w-5xl mx-auto flex justify-center items-center">
        {getVisiblePhotos().map(({ src, index }) => (
          <div
            key={`${src}-${index}-${currentIndex}`}
            className="absolute w-36 md:w-48 h-56 md:h-64 rounded-lg shadow-xl border border-white/10 overflow-hidden cursor-pointer"
            style={getPhotoStyle(index)}
            onClick={() => setCurrentIndex((currentIndex + index) % photos.length)}
          >
            <AspectRatio ratio={3 / 4} className="overflow-hidden rounded-lg">
              <img
                src={src}
                alt={`Foto ${index + 1}`}
                className="w-full h-full object-cover rounded-lg"
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
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-lg"></div>
            )}
          </div>
        ))}
      </div>

      {/* Indicadores de navegação */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {photos.slice(0, Math.min(photos.length, 10)).map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentIndex % Math.min(photos.length, 10)
                ? 'bg-pink-400 scale-125'
                : 'bg-white/40 hover:bg-white/60'
            }`}
          />
        ))}
      </div>

      {/* Controles de navegação */}
      <button
        onClick={() => setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length)}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full transition-all duration-300"
      >
        ←
      </button>
      
      <button
        onClick={() => setCurrentIndex((prev) => (prev + 1) % photos.length)}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full transition-all duration-300"
      >
        →
      </button>
    </div>
  );
};

export default PhotoCarousel;
