
'use client';

import { useState } from 'react';
import imageCompression from 'browser-image-compression';

export default function CompressaoImagensPage() {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [isCompressing, setIsCompressing] = useState(false);
    const [progress, setProgress] = useState<Record<string, number>>({});
    const [compressedFiles, setCompressedFiles] = useState<Array<{ file: File; originalName: string }>>([]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const imageFiles = files.filter(file => file.type.startsWith('image/'));
        setSelectedFiles(imageFiles);
        setCompressedFiles([]);
        setProgress({});
    };

    const downloadFile = (file: File, originalName: string) => {
        const url = URL.createObjectURL(file);
        const link = document.createElement('a');
        link.href = url;
        link.download = originalName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const compressImages = async () => {
        if (selectedFiles.length === 0) return;

        setIsCompressing(true);
        setProgress({});
        const newCompressedFiles: Array<{ file: File; originalName: string }> = [];

        try {
            for (let i = 0; i < selectedFiles.length; i++) {
                const file = selectedFiles[i];
                const originalName = file.name;
                const fileNameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
                const fileExtension = originalName.substring(originalName.lastIndexOf('.')) || '';

                setProgress(prev => ({ ...prev, [originalName]: 0 }));

                const options = {
                    maxSizeMB: 0.6, // Tamanho máximo em MB
                    maxWidthOrHeight: 1920, // Dimensão máxima
                    useWebWorker: true,
                    onProgress: (progress: number) => {
                        setProgress(prev => ({ ...prev, [originalName]: progress }));
                    },
                };

                const compressedFile = await imageCompression(file, options);
                
                // Criar novo arquivo com o nome original
                const renamedFile = new File([compressedFile], originalName, {
                    type: compressedFile.type,
                    lastModified: compressedFile.lastModified,
                });

                newCompressedFiles.push({ file: renamedFile, originalName });
                setProgress(prev => ({ ...prev, [originalName]: 100 }));
            }

            setCompressedFiles(newCompressedFiles);

            // Fazer download automático de todas as imagens comprimidas
            newCompressedFiles.forEach(({ file, originalName }, index) => {
                setTimeout(() => {
                    downloadFile(file, originalName);
                }, 100 * index);
            });

        } catch (error) {
            console.error('Erro ao comprimir imagens:', error);
            alert('Erro ao comprimir imagens. Por favor, tente novamente.');
        } finally {
            setIsCompressing(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">
                    Compressão de Imagens
                </h1>

                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <label className="block mb-4">
                        <span className="block text-sm font-medium text-gray-700 mb-2">
                            Selecione múltiplas imagens
                        </span>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleFileSelect}
                            className="block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-md file:border-0
                                file:text-sm file:font-semibold
                                file:bg-blue-50 file:text-blue-700
                                hover:file:bg-blue-100
                                cursor-pointer"
                            disabled={isCompressing}
                        />
                    </label>

                    {selectedFiles.length > 0 && (
                        <div className="mb-4">
                            <p className="text-sm text-gray-600 mb-2">
                                {selectedFiles.length} imagem(ns) selecionada(s):
                            </p>
                            <ul className="list-disc list-inside text-sm text-gray-500 space-y-1">
                                {selectedFiles.map((file, index) => (
                                    <li key={index}>
                                        {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <button
                        onClick={compressImages}
                        disabled={selectedFiles.length === 0 || isCompressing}
                        className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg
                            hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed
                            transition-colors duration-200"
                    >
                        {isCompressing ? 'Comprimindo...' : 'Comprimir e Baixar Imagens'}
                    </button>
                </div>

                {isCompressing && (
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Progresso da Compressão
                        </h2>
                        <div className="space-y-4">
                            {selectedFiles.map((file) => {
                                const fileProgress = progress[file.name] || 0;
                                return (
                                    <div key={file.name}>
                                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                                            <span className="truncate flex-1 mr-2">{file.name}</span>
                                            <span>{Math.round(fileProgress)}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${fileProgress}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {compressedFiles.length > 0 && !isCompressing && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                        <h2 className="text-xl font-semibold text-green-900 mb-4">
                            ✓ Compressão Concluída!
                        </h2>
                        <p className="text-sm text-green-700 mb-4">
                            {compressedFiles.length} imagem(ns) comprimida(s) e baixada(s) automaticamente.
                        </p>
                        <div className="space-y-2">
                            {compressedFiles.map(({ file, originalName }, index) => (
                                <div key={index} className="text-sm text-green-800">
                                    <span className="font-medium">{originalName}</span>
                                    {' '}
                                    <span className="text-green-600">
                                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
