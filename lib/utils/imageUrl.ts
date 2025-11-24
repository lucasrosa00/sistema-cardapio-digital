/**
 * Verifica se uma string é base64
 */
function isBase64(str: string): boolean {
  // Base64 de imagem geralmente começa com data:image/
  if (str.startsWith('data:image/')) {
    return true;
  }
  
  // Verifica se não é uma URL (http:// ou https://)
  if (str.startsWith('http://') || str.startsWith('https://')) {
    return false;
  }
  
  // Base64 puro (sem data URI) geralmente:
  // - É uma string longa (imagens base64 têm pelo menos alguns KB)
  // - Contém apenas caracteres base64 válidos (A-Z, a-z, 0-9, +, /, =)
  // - Não contém barras ou caracteres de caminho
  const base64Regex = /^[A-Za-z0-9+/=]+$/;
  if (str.length > 100 && base64Regex.test(str) && !str.includes('/') && !str.includes('\\')) {
    return true;
  }
  
  return false;
}

/**
 * Normaliza a URL de uma imagem
 * Se for base64, retorna como está
 * Se for URL completa, retorna como está
 * Se for caminho relativo, adiciona o prefixo do servidor
 * 
 * @param imagePath - Caminho da imagem (pode ser base64, URL completa ou caminho relativo)
 * @returns URL completa da imagem ou base64
 */
export function getImageUrl(imagePath: string | null | undefined): string {
  if (!imagePath) {
    return '';
  }

  // Se já é base64, retorna como está
  if (isBase64(imagePath)) {
    return imagePath;
  }

  // Se já é uma URL completa (http:// ou https://), retorna como está
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // Se for caminho relativo, adiciona o prefixo do servidor
  // Remove barra inicial se existir para evitar duplicação
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `https://pinktech.com.br/uploads${cleanPath}`;
}

