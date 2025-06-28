
// Utility for automatic image optimization and resizing
export const optimizeImage = (file: File, maxWidth: number = 800, maxHeight: number = 600, quality: number = 0.8): Promise<Blob> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions maintaining aspect ratio
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress image
      ctx?.drawImage(img, 0, 0, width, height);
      canvas.toBlob(resolve, 'image/jpeg', quality);
    };
    
    img.src = URL.createObjectURL(file);
  });
};

// Cache thumbnails in localStorage for faster subsequent loads
const THUMBNAIL_CACHE_KEY = 'photo_thumbnails_cache';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

const getThumbnailCache = (): Record<string, { data: string; timestamp: number }> => {
  try {
    const cached = localStorage.getItem(THUMBNAIL_CACHE_KEY);
    return cached ? JSON.parse(cached) : {};
  } catch {
    return {};
  }
};

const setThumbnailCache = (cache: Record<string, { data: string; timestamp: number }>) => {
  try {
    localStorage.setItem(THUMBNAIL_CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.warn('Could not save thumbnail cache:', error);
  }
};

export const loadAndOptimizePhotos = async (): Promise<string[]> => {
  const photoUrls: string[] = [];
  const extensions = ['jpeg', 'jpg', 'png', 'webp'];
  
  console.log('Iniciando detecção rápida de fotos...');
  
  // First, quickly check common patterns in parallel
  const checkPromises: Promise<string | null>[] = [];
  
  for (let i = 1; i <= 20; i++) {
    for (const ext of extensions) {
      const patterns = [
        `/photos/foto (${i}).${ext}`,
        `/photos/foto${i}.${ext}`,
        `/photos/img${i}.${ext}`,
        `/photos/image${i}.${ext}`,
        `/photos/${i}.${ext}`
      ];
      
      patterns.forEach(photoUrl => {
        checkPromises.push(
          fetch(photoUrl, { method: 'HEAD' })
            .then(response => response.ok ? photoUrl : null)
            .catch(() => null)
        );
      });
    }
  }
  
  // Wait for all checks and filter valid URLs
  const results = await Promise.all(checkPromises);
  const validUrls = results.filter(url => url !== null) as string[];
  
  // Remove duplicates and sort
  const uniqueUrls = [...new Set(validUrls)].sort((a, b) => {
    const numA = parseInt(a.match(/\d+/)?.[0] || '0');
    const numB = parseInt(b.match(/\d+/)?.[0] || '0');
    return numA - numB;
  });
  
  photoUrls.push(...uniqueUrls);
  
  console.log(`Total de fotos detectadas: ${photoUrls.length}`);
  return photoUrls;
};

// Create optimized thumbnails with caching
export const createThumbnail = (imageSrc: string, size: number = 200): Promise<string> => {
  return new Promise((resolve) => {
    const cache = getThumbnailCache();
    const cacheKey = `${imageSrc}_${size}`;
    
    // Check if we have a valid cached thumbnail
    if (cache[cacheKey] && Date.now() - cache[cacheKey].timestamp < CACHE_EXPIRY) {
      console.log(`Using cached thumbnail for ${imageSrc}`);
      resolve(cache[cacheKey].data);
      return;
    }
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = size;
      canvas.height = size;
      
      // Calculate crop area for square thumbnail
      const { width, height } = img;
      const cropSize = Math.min(width, height);
      const x = (width - cropSize) / 2;
      const y = (height - cropSize) / 2;
      
      ctx?.drawImage(img, x, y, cropSize, cropSize, 0, 0, size, size);
      const thumbnailData = canvas.toDataURL('image/jpeg', 0.7);
      
      // Cache the thumbnail
      cache[cacheKey] = {
        data: thumbnailData,
        timestamp: Date.now()
      };
      setThumbnailCache(cache);
      
      resolve(thumbnailData);
    };
    
    img.onerror = () => {
      console.warn(`Failed to create thumbnail for ${imageSrc}`);
      resolve(imageSrc); // Fallback to original
    };
    
    img.src = imageSrc;
  });
};

// Preload next images for smoother transitions
export const preloadImages = (urls: string[], startIndex: number = 0, count: number = 3) => {
  const preloadPromises: Promise<void>[] = [];
  
  for (let i = 0; i < count; i++) {
    const index = (startIndex + i) % urls.length;
    const url = urls[index];
    
    if (url) {
      const promise = new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => resolve();
        img.src = url;
      });
      preloadPromises.push(promise);
    }
  }
  
  return Promise.all(preloadPromises);
};
