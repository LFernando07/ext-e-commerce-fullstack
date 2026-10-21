import { prisma, isPrismaConfigured } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token de recuperación no proporcionado' },
        { status: 400 }
      );
    }

    if (!isPrismaConfigured()) {
      return NextResponse.json(
        { error: 'Base de datos no configurada' },
        { status: 503 }
      );
    }

    const cart = await prisma.abandonedCart.findUnique({
      where: { recoveryToken: token },
    });

    if (!cart) {
      return NextResponse.json(
        { error: 'Carrito no encontrado o el enlace ha caducado' },
        { status: 404 }
      );
    }

    // Marcar como recuperado
    await prisma.abandonedCart.update({
      where: { id: cart.id },
      data: { status: 'recovered' },
    });

    return NextResponse.json({
      success: true,
      cart: {
        id: cart.id,
        email: cart.email,
        customerName: cart.customerName,
        items: cart.items,
        totalZeni: cart.totalZeni,
        recoveryToken: cart.recoveryToken,
      },
    });
  } catch (error) {
    if ((error as { digest?: string })?.digest === 'NEXT_PRERENDER_INTERRUPTED') {
      throw error;
    }
    console.error('Error recuperando carrito:', error);
    return NextResponse.json(
      { error: 'Error al procesar la recuperación del carrito' },
      { status: 500 }
    );
  }
}
