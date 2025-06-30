
export const resizeImage = (file: File, maxWidth: number, quality: number = 0.8): Promise<Blob> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();

    img.onload = () => {
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob(resolve, 'image/jpeg', quality);
    };

    img.src = URL.createObjectURL(file);
  });
};

export const createThumbnail = async (file: File): Promise<Blob> => {
  return resizeImage(file, 400, 0.7);
};

export const optimizeForCarousel = async (file: File): Promise<Blob> => {
  return resizeImage(file, 800, 0.8);
};
