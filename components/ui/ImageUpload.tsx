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

  // Função para comprimir e redimensionar imagem
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Tamanho máximo para redimensionar (mantendo aspect ratio)
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          const QUALITY = 0.8; // Qualidade de compressão (0.8 = 80%)

          let width = img.width;
          let height = img.height;

          // Calcula as novas dimensões mantendo o aspect ratio
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

          // Cria canvas para redimensionar e comprimir
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            reject(new Error('Não foi possível criar contexto do canvas'));
            return;
          }

          // Desenha a imagem redimensionada no canvas
          ctx.drawImage(img, 0, 0, width, height);

          // Converte para base64 com compressão
          const base64String = canvas.toDataURL('image/jpeg', QUALITY);
          resolve(base64String);
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remainingSlots = maxImages - images.length;
    const filesToProcess = Array.from(files)
      .filter((file) => file.type.startsWith('image/'))
      .slice(0, remainingSlots);

    if (filesToProcess.length === 0) return;

    try {
      // Comprime todas as imagens
      const compressedImages = await Promise.all(
        filesToProcess.map((file) => compressImage(file))
      );

      // Adiciona as imagens comprimidas
      onImagesChange([...images, ...compressedImages]);
    } catch (error) {
      console.error('Erro ao comprimir imagens:', error);
      alert('Erro ao processar imagens. Tente novamente.');
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
        accept="image/*"
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

