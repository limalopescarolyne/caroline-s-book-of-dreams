import React, { useState, useEffect } from 'react';
import { AspectRatio } from '@/components/ui/aspect-ratio';

const PhotoCarousel = () => {
  const [photos, setPhotos] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shuffledPhotos, setShuffledPhotos] = useState<string[]>([]);

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

  const shuffleArray = (array: string[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  useEffect(() => {
    const initialPhotos = placeholderPhotos;
    setPhotos(initialPhotos);
    setShuffledPhotos(shuffleArray(initialPhotos));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % shuffledPhotos.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [shuffledPhotos.length]);

  const getPhotoStyle = (index: number) => {
    const totalPhotos = Math.min(shuffledPhotos.length, 7);
    const center = Math.floor(totalPhotos / 2);
    const distance = Math.abs(index - center);

    let transform = '';
    let zIndex = 10 - distance;
    let opacity = 1 - (distance * 0.15);
    let blur = distance * 1.5;
    let scale = 1 - (distance * 0.07);

    if (index < center) {
      transform = `translateX(-${distance * 60}px) rotateY(${distance * 10}deg) scale(${scale})`;
    } else if (index > center) {
      transform = `translateX(${distance * 60}px) rotateY(-${distance * 10}deg) scale(${scale})`;
    } else {
      transform = `scale(1.08)`;
      opacity = 1;
      blur = 0;
      zIndex = 20;
    }

    return {
      transform,
      zIndex,
      opacity,
      filter: `blur(${blur}px)`,
      transition: 'all 0.9s ease-in-out',
    };
  };

  const getVisiblePhotos = () => {
    const visibleCount = 7;
    const photos = [];

    for (let i = 0; i < visibleCount && i < shuffledPhotos.length; i++) {
      const photoIndex = (currentIndex + i) % shuffledPhotos.length;
      photos.push({
        src: shuffledPhotos[photoIndex],
        index: i,
      });
    }

    return photos;
  };

  return (
    <div className="relative h-96 md:h-[500px] flex items-center justify-center overflow-hidden perspective-1000">
      <div className="relative w-full max-w-6xl mx-auto flex justify-center items-center">
        {getVisiblePhotos().map(({ src, index }) => (
          <div
            key={`${src}-${index}-${currentIndex}`}
            className="absolute w-40 md:w-56 h-64 md:h-72 rounded-xl shadow-2xl border border-white/20 overflow-hidden"
            style={getPhotoStyle(index)}
          >
            <AspectRatio ratio={3 / 4} className="overflow-hidden rounded-xl">
              <img
                src={src}
                alt={`Foto ${index + 1}`}
                className="w-full h-full object-cover rounded-xl shadow-md"
                loading="lazy"
              />
            </AspectRatio>
            {index === Math.floor(7 / 2) && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-xl"></div>
            )}
          </div>
        ))}
      </div>

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {shuffledPhotos.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 shadow-sm ${
              index === currentIndex
                ? 'bg-pink-500 scale-125'
                : 'bg-white/30 hover:bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default PhotoCarousel;
