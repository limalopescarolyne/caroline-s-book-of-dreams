
import { useState, useEffect } from 'react';

interface SystemSettings {
  carouselPhotosCount: number;
}

export const useSystemSettings = () => {
  const [settings, setSettings] = useState<SystemSettings>({
    carouselPhotosCount: 5
  });

  const loadSettings = () => {
    const savedCount = localStorage.getItem('carousel_photos_count');
    if (savedCount) {
      const count = parseInt(savedCount, 10);
      if (count >= 3 && count <= 8) {
        setSettings({
          carouselPhotosCount: count
        });
      }
    }
  };

  const updateCarouselPhotosCount = (count: number) => {
    const validCount = Math.min(8, Math.max(3, count));
    localStorage.setItem('carousel_photos_count', validCount.toString());
    setSettings({
      carouselPhotosCount: validCount
    });
  };

  useEffect(() => {
    loadSettings();
    
    // Escutar mudanças no localStorage
    const handleStorageChange = () => {
      loadSettings();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return {
    settings,
    updateCarouselPhotosCount
  };
};
