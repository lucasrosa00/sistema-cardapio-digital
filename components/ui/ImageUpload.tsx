'use client';

import React, { useRef, useState, useEffect } from 'react';
import { getImageUrl } from '@/lib/utils/imageUrl';

interface ImageFile {
  file: File;
  preview: string; // URL para preview
  id: string; // ID único para identificar o arquivo
}

interface ImageUploadProps {
  images: string[]; // URLs das imagens já salvas (para preview)
  onFilesChange: (files: File[]) => void; // Callback com os arquivos File
  onImagesChange?: (images: string[]) => void; // Callback para atualizar imagens salvas
  maxImages?: number;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  images,
  onFilesChange,
  onImagesChange,
  maxImages = 10,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<ImageFile[]>([]);

  // Limpar previews quando componente desmontar ou selectedFiles mudar
  useEffect(() => {
    return () => {
      selectedFiles.forEach((imageFile) => {
        if (imageFile.preview.startsWith('blob:')) {
          URL.revokeObjectURL(imageFile.preview);
        }
      });
    };
  }, [selectedFiles]);

  // Função para comprimir e redimensionar imagem
  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          const QUALITY = 0.8;

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

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            reject(new Error('Não foi possível criar contexto do canvas'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Erro ao comprimir imagem'));
                return;
              }
              
              // Criar novo File com o blob comprimido
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              
              resolve(compressedFile);
            },
            'image/jpeg',
            QUALITY
          );
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

    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB em bytes

    const remainingSlots = maxImages - (images.length + selectedFiles.length);
    
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
      const confirmMessage = `${fileCount} ${fileText} excede(m) o limite de 5MB. Deseja comprimir ${fileText === 'imagem' ? 'a imagem' : 'as imagens'} automaticamente?`;
      
      const shouldCompress = window.confirm(confirmMessage);
      
      if (!shouldCompress) {
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }
    }

    const filesToProcess = allFiles.slice(0, remainingSlots);

    if (filesToProcess.length === 0) return;

    try {
      // Processar todos os arquivos
      const processedFiles = await Promise.all(
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
                  return await compressImage(file);
                } else {
                  return file;
                }
              } catch (heicError) {
                throw new Error(`Arquivo HEIC "${file.name}" não pode ser processado. Por favor, converta para JPEG ou PNG antes de enviar.`);
              }
            }

            // Comprimir se necessário
            if (file.size > MAX_FILE_SIZE) {
              return await compressImage(file);
            } else {
              return file;
            }
          } catch (fileError) {
            if (fileError instanceof Error && fileError.message.includes('HEIC')) {
              throw fileError;
            }
            throw new Error(`Erro ao processar "${file.name}": ${fileError instanceof Error ? fileError.message : 'Erro desconhecido'}`);
          }
        })
      );

      // Criar objetos ImageFile com preview
      const newImageFiles: ImageFile[] = processedFiles.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        id: `${Date.now()}-${Math.random()}`,
      }));

      // Adiciona os novos arquivos
      const updatedFiles = [...selectedFiles, ...newImageFiles];
      setSelectedFiles(updatedFiles);
      
      // Notificar componente pai com os arquivos
      onFilesChange(updatedFiles.map(img => img.file));

    } catch (error) {
      console.error('Erro ao processar imagens:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao processar imagens. Tente novamente.';
      alert(errorMessage);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (id: string) => {
    // Verificar se é um arquivo novo (blob) ou imagem salva
    const fileToRemove = selectedFiles.find(img => img.id === id);
    
    if (fileToRemove) {
      // É um arquivo novo selecionado
      if (fileToRemove.preview.startsWith('blob:')) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      
      const newFiles = selectedFiles.filter((img) => img.id !== id);
      setSelectedFiles(newFiles);
      
      // Notificar componente pai
      onFilesChange(newFiles.map(img => img.file));
    } else {
      // É uma imagem salva - remover da lista de imagens
      const imageIndex = parseInt(id.replace('saved-', ''));
      if (!isNaN(imageIndex) && onImagesChange) {
        const newImages = images.filter((_, index) => index !== imageIndex);
        onImagesChange(newImages);
      }
    }
  };

  // Combinar imagens salvas (URLs) com arquivos selecionados (previews)
  const allImages = [
    ...images.map((url, index) => ({ url, id: `saved-${index}`, isSaved: true })),
    ...selectedFiles.map((img) => ({ url: img.preview, id: img.id, isSaved: false })),
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={allImages.length >= maxImages}
          className={`
            px-4 py-2 border-2 border-dashed rounded-lg
            transition-colors
            ${allImages.length >= maxImages
              ? 'border-gray-300 text-gray-400 cursor-not-allowed'
              : 'border-gray-400 text-gray-700 hover:border-blue-500 hover:text-blue-600'
            }
          `}
        >
          + Adicionar Imagem
        </button>
        <span className="text-sm text-gray-500">
          {allImages.length} / {maxImages} imagens
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

      {allImages.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {allImages.map((image) => {
            // Para imagens salvas, usar getImageUrl para normalizar a URL
            // Para previews de blob (novas imagens), usar diretamente o blob URL
            const imageSrc = image.isSaved 
              ? getImageUrl(image.url)
              : image.url; // blob URL já está pronto para uso
            
            return (
              <div key={image.id} className="relative group">
                <img
                  src={imageSrc}
                  alt={`Preview ${image.id}`}
                  className="w-full aspect-square object-cover rounded-lg"
                  onError={(e) => {
                    console.error('Erro ao carregar imagem:', imageSrc);
                    // Fallback para imagem quebrada
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect width="200" height="200" fill="%23ddd"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3EImagem não encontrada%3C/text%3E%3C/svg%3E';
                  }}
                />
                <button
                  type="button"
                  onClick={() => removeFile(image.id)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  title="Remover imagem"
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
