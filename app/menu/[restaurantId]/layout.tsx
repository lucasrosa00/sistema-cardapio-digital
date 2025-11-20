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

    const metadata: Metadata = {
      title: restaurantName + " - Cardápio Digital",
      description: `Cardápio digital de ${restaurantName}`,
    };

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

