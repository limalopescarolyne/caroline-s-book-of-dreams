
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

export const loadAndOptimizePhotos = async (): Promise<string[]> => {
  const photoUrls: string[] = [];
  const extensions = ['jpeg', 'jpg', 'png', 'webp'];
  const maxPhotos = 50;
  
  console.log('Iniciando detecção automática de fotos...');
  
  for (let i = 1; i <= maxPhotos; i++) {
    let photoFound = false;
    
    for (const ext of extensions) {
      // Try different naming patterns
      const patterns = [
        `/photos/foto (${i}).${ext}`,
        `/photos/foto${i}.${ext}`,
        `/photos/img${i}.${ext}`,
        `/photos/image${i}.${ext}`,
        `/photos/${i}.${ext}`
      ];
      
      for (const photoUrl of patterns) {
        try {
          const response = await fetch(photoUrl, { method: 'HEAD' });
          if (response.ok) {
            photoUrls.push(photoUrl);
            photoFound = true;
            console.log(`Foto detectada: ${photoUrl}`);
            break;
          }
        } catch (error) {
          continue;
        }
      }
      
      if (photoFound) break;
    }
  }
  
  console.log(`Total de fotos detectadas: ${photoUrls.length}`);
  return photoUrls;
};

// Create optimized thumbnails for better performance
export const createThumbnail = (imageSrc: string, size: number = 200): Promise<string> => {
  return new Promise((resolve) => {
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
      resolve(canvas.toDataURL('image/jpeg', 0.7));
    };
    
    img.src = imageSrc;
  });
};
