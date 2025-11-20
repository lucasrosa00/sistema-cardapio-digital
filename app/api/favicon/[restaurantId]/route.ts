import { NextRequest, NextResponse } from 'next/server';
import { restaurantService } from '@/lib/api/restaurantService';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ restaurantId: string }> }
) {
  try {
    const { restaurantId } = await context.params;
    const slug = restaurantId;

    const menuData = await restaurantService.getPublicMenu(slug);
    const logo = menuData.restaurant.logo;

    if (!logo || !logo.startsWith('data:')) {
      return new NextResponse(null, { status: 404 });
    }

    const matches = logo.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches) {
      return new NextResponse(null, { status: 500 });
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Erro ao servir favicon:', error);
    return new NextResponse(null, { status: 500 });
  }
}

