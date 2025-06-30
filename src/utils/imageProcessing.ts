
export const resizeImage = (file: File, maxWidth: number, quality: number = 0.8): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      img.onload = () => {
        try {
          const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
          canvas.width = img.width * ratio;
          canvas.height = img.height * ratio;

          // Usar configurações de alta qualidade
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create blob'));
            }
          }, 'image/jpeg', quality);
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = URL.createObjectURL(file);
    } catch (error) {
      reject(error);
    }
  });
};

export const createThumbnail = async (file: File): Promise<Blob> => {
  return resizeImage(file, 300, 0.7);
};

export const optimizeForCarousel = async (file: File): Promise<Blob> => {
  return resizeImage(file, 800, 0.85);
};

export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result.split(',')[1]);
      } else {
        reject(new Error('Failed to convert blob to base64'));
      }
    };
    reader.onerror = () => reject(new Error('FileReader error'));
    reader.readAsDataURL(blob);
  });
};

export const base64ToBlob = (base64: string, mimeType: string = 'image/jpeg'): Blob => {
  try {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  } catch (error) {
    console.error('Erro ao converter base64 para blob:', error);
    // Retornar blob vazio em caso de erro
    return new Blob([], { type: mimeType });
  }
};

export const createImageUrl = (base64Data: string, mimeType: string = 'image/jpeg'): string => {
  try {
    if (!base64Data) {
      return '/placeholder.svg?height=600&width=400&text=Imagem+Não+Disponível';
    }
    
    const blob = base64ToBlob(base64Data, mimeType);
    if (blob.size === 0) {
      return '/placeholder.svg?height=600&width=400&text=Erro+ao+Carregar';
    }
    
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Erro ao criar URL da imagem:', error);
    return '/placeholder.svg?height=600&width=400&text=Erro+ao+Carregar';
  }
};
