'use client';

import React, { useRef } from 'react';

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  images,
  onImagesChange,
  maxImages = 10,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Função para calcular o tamanho do base64 em bytes
  const getBase64Size = (base64String: string): number => {
    // Remove o prefixo "data:image/jpeg;base64," e calcula o tamanho
    const base64Data = base64String.split(',')[1] || base64String;
    return (base64Data.length * 3) / 4;
  };

  // Função para comprimir e redimensionar imagem até ficar abaixo do tamanho máximo
  const compressImageToSize = (
    file: File,
    maxSizeBytes: number,
    initialQuality: number = 0.8
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          const MIN_QUALITY = 0.3;
          const QUALITY_STEP = 0.1;

          let width = img.width;
          let height = img.height;

          // Redimensiona se necessário
          if (width > height) {
            if (width > MAX_WIDTH) {
              height = (height * MAX_WIDTH) / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = (width * MAX_HEIGHT) / height;
              height = MAX_HEIGHT;
            }
          }

          // Tenta diferentes níveis de qualidade até ficar abaixo do limite
          const tryCompress = (quality: number, currentWidth: number, currentHeight: number): string | null => {
            const canvas = document.createElement('canvas');
            canvas.width = currentWidth;
            canvas.height = currentHeight;
            const ctx = canvas.getContext('2d');

            if (!ctx) {
              return null;
            }

            ctx.drawImage(img, 0, 0, currentWidth, currentHeight);
            const base64String = canvas.toDataURL('image/jpeg', quality);
            const size = getBase64Size(base64String);

            if (size <= maxSizeBytes) {
              return base64String;
            }

            return null;
          };

          // Tenta com qualidade inicial
          let quality = initialQuality;
          let result = tryCompress(quality, width, height);

          // Se não funcionou, reduz qualidade progressivamente
          while (!result && quality >= MIN_QUALITY) {
            quality -= QUALITY_STEP;
            result = tryCompress(quality, width, height);
          }

          // Se ainda não funcionou, reduz dimensões também
          if (!result) {
            let currentWidth = width;
            let currentHeight = height;
            quality = MIN_QUALITY;

            while (!result && currentWidth > 400 && currentHeight > 400) {
              currentWidth = Math.floor(currentWidth * 0.9);
              currentHeight = Math.floor(currentHeight * 0.9);
              result = tryCompress(quality, currentWidth, currentHeight);
            }
          }

          if (result) {
            resolve(result);
          } else {
            reject(new Error('Não foi possível comprimir a imagem abaixo do limite de 1.5MB'));
          }
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Função para calcular a qualidade de compressão baseada no tamanho do arquivo
  const getQualityByFileSize = (fileSizeBytes: number): number => {
    const fileSizeMB = fileSizeBytes / (1024 * 1024); // Converte bytes para MB
    
    // Escala progressiva de qualidade baseada no tamanho
    // Quanto maior o arquivo, menor a qualidade para reduzir mais o tamanho
    if (fileSizeMB >= 15) {
      return 0.1; // Para arquivos de 15MB ou mais, usa qualidade mínima
    } else if (fileSizeMB >= 10) {
      return 0.15;
    } else if (fileSizeMB >= 7) {
      return 0.2;
    } else if (fileSizeMB >= 5) {
      return 0.3;
    } else if (fileSizeMB >= 3) {
      return 0.4;
    } else if (fileSizeMB >= 1.5) {
      return 0.5;
    } else if (fileSizeMB >= 1) {
      return 0.6;
    } else if (fileSizeMB >= 0.5) {
      return 0.7;
    } else {
      return 0.8; // Para arquivos pequenos, mantém qualidade alta
    }
  };

  // Função para comprimir e redimensionar imagem (versão padrão)
  // A qualidade é ajustada automaticamente baseada no tamanho do arquivo
  const compressImage = (file: File): Promise<string> => {
    const quality = getQualityByFileSize(file.size);
    return compressImageToSize(file, Infinity, quality);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const MAX_FILE_SIZE = 1.5 * 1024 * 1024; // 1.5MB em bytes

    const remainingSlots = maxImages - images.length;
    // Aceita imagens e arquivos HEIC/HEIF
    const allFiles = Array.from(files).filter((file) => {
      const isImage = file.type.startsWith('image/');
      const isHeic = file.name.toLowerCase().endsWith('.heic') || 
                     file.name.toLowerCase().endsWith('.heif') ||
                     file.type === 'image/heic' || 
                     file.type === 'image/heif';
      return isImage || isHeic;
    });

    // Verificar arquivos HEIC e mostrar aviso
    const heicFiles = allFiles.filter((file) => {
      return file.name.toLowerCase().endsWith('.heic') || 
             file.name.toLowerCase().endsWith('.heif') ||
             file.type === 'image/heic' || 
             file.type === 'image/heif';
    });

    if (heicFiles.length > 0) {
      const heicCount = heicFiles.length;
      const fileText = heicCount === 1 ? 'arquivo HEIC' : 'arquivos HEIC';
      const message = `${heicCount} ${fileText} ${heicCount === 1 ? 'foi' : 'foram'} detectado(s). Arquivos HEIC podem não ser suportados por todos os navegadores. Se houver erro, tente converter para JPEG ou PNG antes de enviar.`;
      alert(message);
    }
    
    // Verificar tamanho dos arquivos antes de processar
    const oversizedFiles = allFiles.filter((file) => file.size > MAX_FILE_SIZE);
    
    if (oversizedFiles.length > 0) {
      const fileCount = oversizedFiles.length;
      const fileText = fileCount === 1 ? 'imagem' : 'imagens';
      const confirmMessage = `${fileCount} ${fileText} excede(m) o limite de 1.5MB. Deseja comprimir ${fileText === 'imagem' ? 'a imagem' : 'as imagens'} automaticamente para que fique(m) abaixo do limite?`;
      
      const shouldCompress = window.confirm(confirmMessage);
      
      if (!shouldCompress) {
        // Reset input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }
    }

    const filesToProcess = allFiles.slice(0, remainingSlots);

    if (filesToProcess.length === 0) return;

    try {
      // Comprime todas as imagens
      // A qualidade é ajustada automaticamente baseada no tamanho de cada arquivo
      const compressedImages = await Promise.all(
        filesToProcess.map(async (file) => {
          try {
            // Verificar se é arquivo HEIC
            const isHeic = file.name.toLowerCase().endsWith('.heic') || 
                          file.name.toLowerCase().endsWith('.heif') ||
                          file.type === 'image/heic' || 
                          file.type === 'image/heif';
            
            if (isHeic) {
              // Tentar processar HEIC - pode falhar se o navegador não suportar
              try {
                if (file.size > MAX_FILE_SIZE) {
                  const quality = getQualityByFileSize(file.size);
                  return await compressImageToSize(file, MAX_FILE_SIZE, quality);
                } else {
                  return await compressImage(file);
                }
              } catch (heicError) {
                throw new Error(`Arquivo HEIC "${file.name}" não pode ser processado. Por favor, converta para JPEG ou PNG antes de enviar.`);
              }
            }

            if (file.size > MAX_FILE_SIZE) {
              // Para arquivos que excedem o limite, usa qualidade adaptativa e força limite de 1.5MB
              const quality = getQualityByFileSize(file.size);
              return await compressImageToSize(file, MAX_FILE_SIZE, quality);
            } else {
              // Usa compressão adaptativa baseada no tamanho do arquivo
              return await compressImage(file);
            }
          } catch (fileError) {
            // Se for erro específico do arquivo, relançar com nome do arquivo
            if (fileError instanceof Error && fileError.message.includes('HEIC')) {
              throw fileError;
            }
            throw new Error(`Erro ao processar "${file.name}": ${fileError instanceof Error ? fileError.message : 'Erro desconhecido'}`);
          }
        })
      );

      // Adiciona as imagens comprimidas
      onImagesChange([...images, ...compressedImages]);
    } catch (error) {
      console.error('Erro ao comprimir imagens:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao processar imagens. Tente novamente.';
      alert(errorMessage);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={images.length >= maxImages}
          className={`
            px-4 py-2 border-2 border-dashed rounded-lg
            transition-colors
            ${images.length >= maxImages
              ? 'border-gray-300 text-gray-400 cursor-not-allowed'
              : 'border-gray-400 text-gray-700 hover:border-blue-500 hover:text-blue-600'
            }
          `}
        >
          + Adicionar Imagem
        </button>
        <span className="text-sm text-gray-500">
          {images.length} / {maxImages} imagens
        </span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.heic,.heif"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <img
                src={image}
                alt={`Preview ${index + 1}`}
                className="w-full aspect-square object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

