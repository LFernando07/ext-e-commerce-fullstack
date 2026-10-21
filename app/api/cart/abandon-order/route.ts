import { prisma, isPrismaConfigured } from '@/lib/prisma';
import { sendAbandonedCartEmail, AbandonedCartEmailItem } from '@/lib/email';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { orderCode } = await req.json();

    if (!orderCode) {
      return NextResponse.json(
        { error: 'orderCode es obligatorio' },
        { status: 400 }
      );
    }

    if (!isPrismaConfigured()) {
      return NextResponse.json({
        success: true,
        mocked: true,
        message: 'Base de datos no configurada (simulado)',
      });
    }

    // Buscar la orden en Supabase
    const order = await prisma.capsuleOrder.findUnique({
      where: { orderCode },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Orden no encontrada' },
        { status: 404 }
      );
    }

    // Si ya está pagada, no abandonarla
    if (order.paymentStatus === 'paid') {
      return NextResponse.json({
        success: false,
        message: 'La orden ya fue pagada',
      });
    }

    // Actualizar estado de la orden en Supabase
    await prisma.capsuleOrder.update({
      where: { id: order.id },
      data: { paymentStatus: 'abandoned' },
    });

    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`;

    const recoveryToken = crypto.randomBytes(16).toString('hex');
    const recoveryUrl = `${baseUrl}/?recover_cart=${recoveryToken}`;

    const cartItems: AbandonedCartEmailItem[] = order.items.map((i) => ({
      name: i.name,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      image: i.image,
    }));

    // El correo registrado en Resend permitido en sandbox
    const recipientEmail = 'lfbp5000@gmail.com';

    // Guardar en tabla abandoned_carts
    const abandonedCart = await prisma.abandonedCart.create({
      data: {
        email: recipientEmail,
        customerName: order.customerName,
        items: JSON.parse(JSON.stringify(cartItems)),
        totalZeni: order.totalZeni,
        recoveryToken,
        status: 'abandoned',
      },
    });

    // Enviar correo transaccional de recuperación con Resend
    const emailResult = await sendAbandonedCartEmail({
      to: recipientEmail,
      customerName: order.customerName,
      items: cartItems,
      totalAmount: order.totalZeni,
      recoveryUrl,
      discountCode: 'HOIPOI10',
    });

    if (emailResult.success) {
      await prisma.abandonedCart.update({
        where: { id: abandonedCart.id },
        data: {
          emailSent: true,
          emailSentAt: new Date(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      recoveryToken,
      recoveryUrl,
      emailSent: emailResult.success,
      emailId: emailResult.id,
      message: `Carrito marcado como abandonado y correo enviado a ${recipientEmail}`,
    });
  } catch (error) {
    console.error('Error procesando orden abandonada:', error);
    return NextResponse.json(
      { error: 'Error al procesar carrito abandonado' },
      { status: 500 }
    );
  }
}
