'use client';

import { useEffect } from 'react';

interface FaviconProps {
  url: string;
}

export function Favicon({ url }: FaviconProps) {
  useEffect(() => {
    // Remove favicons existentes
    const existing = document.querySelectorAll('link[rel*="icon"]');
    existing.forEach((link) => link.remove());

    // Adiciona novo favicon
    const link = document.createElement('link');
    link.rel = 'icon';
    link.href = url;
    document.head.appendChild(link);

    const shortcut = document.createElement('link');
    shortcut.rel = 'shortcut icon';
    shortcut.href = url;
    document.head.appendChild(shortcut);
  }, [url]);

  return null;
}

