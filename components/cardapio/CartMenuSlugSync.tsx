'use client';

import { useLayoutEffect } from 'react';
import { useCartStore } from '@/store/cartStore';

/** Limpa o carrinho ao abrir outro estabelecimento (slug diferente na URL). */
export function CartMenuSlugSync({ restaurantSlug }: { restaurantSlug: string }) {
  useLayoutEffect(() => {
    useCartStore.getState().syncMenuSlug(restaurantSlug);
  }, [restaurantSlug]);

  return null;
}
