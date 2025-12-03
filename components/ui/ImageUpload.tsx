'use client';

import React, { useRef, useState, useEffect } from 'react';
import { getImageUrl } from '@/lib/utils/imageUrl';
import imageCompression from 'browser-image-compression';

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
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState<Record<string, number>>({});

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

  // Função para comprimir imagem usando browser-image-compression
  const compressImage = async (file: File, onProgress?: (progress: number) => void): Promise<File> => {
    try {
      const options = {
        maxSizeMB: 0.6, // Tamanho máximo em MB (mesmo da página de compressão)
        maxWidthOrHeight: 1920, // Dimensão máxima
        useWebWorker: true,
        fileType: file.type.startsWith('image/') ? file.type : 'image/jpeg',
        onProgress: onProgress || (() => {}),
      };

      const compressedFile = await imageCompression(file, options);
      
      // Manter o nome original do arquivo
      const originalName = file.name;
      const renamedFile = new File([compressedFile], originalName, {
        type: compressedFile.type,
        lastModified: compressedFile.lastModified,
      });

      return renamedFile;
    } catch (error) {
      console.error('Erro ao comprimir imagem:', error);
      // Se houver erro na compressão, retornar o arquivo original
      return file;
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

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

    const filesToProcess = allFiles.slice(0, remainingSlots);

    if (filesToProcess.length === 0) return;

    setIsCompressing(true);
    setCompressionProgress({});

    try {
      // Comprimir todas as imagens automaticamente (mesma compressão da página de compressão)
      const processedFiles = await Promise.all(
        filesToProcess.map(async (file) => {
          try {
            // Inicializar progresso
            setCompressionProgress(prev => ({ ...prev, [file.name]: 0 }));

            // Verificar se é arquivo HEIC
            const isHeic = file.name.toLowerCase().endsWith('.heic') || 
                          file.name.toLowerCase().endsWith('.heif') ||
                          file.type === 'image/heic' || 
                          file.type === 'image/heif';
            
            if (isHeic) {
              // Tentar comprimir HEIC - pode falhar se o navegador não suportar
              try {
                const compressed = await compressImage(file, (progress) => {
                  setCompressionProgress(prev => ({ ...prev, [file.name]: progress }));
                });
                setCompressionProgress(prev => ({ ...prev, [file.name]: 100 }));
                return compressed;
              } catch (heicError) {
                throw new Error(`Arquivo HEIC "${file.name}" não pode ser processado. Por favor, converta para JPEG ou PNG antes de enviar.`);
              }
            }

            // Comprimir todas as imagens automaticamente
            const compressed = await compressImage(file, (progress) => {
              setCompressionProgress(prev => ({ ...prev, [file.name]: progress }));
            });
            setCompressionProgress(prev => ({ ...prev, [file.name]: 100 }));
            return compressed;
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
    } finally {
      setIsCompressing(false);
      setCompressionProgress({});
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
          disabled={allImages.length >= maxImages || isCompressing}
          className={`
            px-4 py-2 border-2 border-dashed rounded-lg
            transition-colors
            ${allImages.length >= maxImages || isCompressing
              ? 'border-gray-300 text-gray-400 cursor-not-allowed'
              : 'border-gray-400 text-gray-700 hover:border-blue-500 hover:text-blue-600'
            }
          `}
        >
          {isCompressing ? 'Comprimindo...' : '+ Adicionar Imagem'}
        </button>
        <span className="text-sm text-gray-500">
          {allImages.length} / {maxImages} imagens
        </span>
      </div>

      {/* Indicador de compressão */}
      {isCompressing && Object.keys(compressionProgress).length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm font-medium text-blue-900 mb-3">
            Comprimindo imagens...
          </p>
          <div className="space-y-2">
            {Object.entries(compressionProgress).map(([fileName, progress]) => (
              <div key={fileName}>
                <div className="flex justify-between text-xs text-blue-700 mb-1">
                  <span className="truncate flex-1 mr-2">{fileName}</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
