import { Metadata } from 'next';
import { restaurantService } from '@/lib/api/restaurantService';
import { getServiceTypeLabel } from '@/lib/utils/serviceType';

type Props = {
  params: Promise<{ restaurantId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { restaurantId } = await params;
  const slug = restaurantId;

  try {
    const menuData = await restaurantService.getPublicMenu(slug);
    const restaurant = menuData.restaurant;
    
    const serviceLabel = getServiceTypeLabel(restaurant.serviceType);
    const restaurantName = restaurant.restaurantName || serviceLabel;

    const metadata: Metadata = {
      title: restaurantName + " - " + serviceLabel,
      description: `${serviceLabel.toLowerCase()} de ${restaurantName}`,
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

