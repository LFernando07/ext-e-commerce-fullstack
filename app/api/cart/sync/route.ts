import { prisma, isPrismaConfigured } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { items, totalZeni, email, customerName, userId } = await req.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: true, message: 'Carrito vacío' });
    }

    if (!isPrismaConfigured()) {
      return NextResponse.json({
        success: true,
        mocked: true,
        recoveryToken: 'mock_token_' + Date.now(),
      });
    }

    const effectiveEmail = email?.trim().toLowerCase() || 'invitado@capsulecorp.com';
    const effectiveName = customerName?.trim() || 'Viajero Hoi-Poi';

    // Buscar si ya existe un carrito activo para este usuario/correo
    const existingCart = await prisma.abandonedCart.findFirst({
      where: {
        email: effectiveEmail,
        status: { in: ['active', 'abandoned'] },
      },
      orderBy: { updatedAt: 'desc' },
    });

    let savedCart;

    if (existingCart) {
      savedCart = await prisma.abandonedCart.update({
        where: { id: existingCart.id },
        data: {
          items: JSON.parse(JSON.stringify(items)),
          totalZeni: Number(totalZeni) || 0,
          customerName: effectiveName,
          userId: userId || existingCart.userId,
          status: 'active',
          updatedAt: new Date(),
        },
      });
    } else {
      const recoveryToken = crypto.randomBytes(16).toString('hex');
      savedCart = await prisma.abandonedCart.create({
        data: {
          email: effectiveEmail,
          customerName: effectiveName,
          userId: userId || null,
          items: JSON.parse(JSON.stringify(items)),
          totalZeni: Number(totalZeni) || 0,
          recoveryToken,
          status: 'active',
        },
      });
    }

    return NextResponse.json({
      success: true,
      cartId: savedCart.id,
      recoveryToken: savedCart.recoveryToken,
    });
  } catch (error) {
    console.error('Error sincronizando carrito:', error);
    return NextResponse.json(
      { error: 'Error al sincronizar estado del carrito' },
      { status: 500 }
    );
  }
}
