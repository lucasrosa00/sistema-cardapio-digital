import { Metadata } from 'next';
import { restaurantService } from '@/lib/api/restaurantService';

type Props = {
  params: Promise<{ restaurantId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { restaurantId } = await params;
  const slug = restaurantId;

  try {
    const menuData = await restaurantService.getPublicMenu(slug);
    const restaurant = menuData.restaurant;
    
    const restaurantName = restaurant.restaurantName || 'Cardápio Digital';
    const logo = restaurant.logo;

    const metadata: Metadata = {
      title: restaurantName,
      description: `Cardápio digital de ${restaurantName}`,
    };

    // Se houver logo, adiciona o favicon
    if (logo) {
      const faviconUrl = `/api/favicon/${slug}`;
      
      // Detecta o tipo MIME da logo
      let imageType = 'image/png';
      if (logo.startsWith('data:')) {
        const match = logo.match(/data:([^;]+)/);
        if (match) {
          imageType = match[1];
        }
      }
      
      metadata.icons = {
        icon: [
          { url: faviconUrl, type: imageType },
        ],
        shortcut: faviconUrl,
        apple: faviconUrl,
      };
    }

    return metadata;
  } catch (error) {
    console.error('Erro ao carregar metadados do restaurante:', error);
    return {
      title: 'Cardápio Digital',
      description: 'Cardápio digital',
    };
  }
}

export default function MenuLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

