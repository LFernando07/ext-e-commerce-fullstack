import { prisma, isPrismaConfigured } from '@/lib/prisma';
import { sendAbandonedCartEmail, AbandonedCartEmailItem } from '@/lib/email';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * GET: Obtener lista de carritos abandonados para el panel de administración
 */
export async function GET() {
  try {
    if (!isPrismaConfigured()) {
      return NextResponse.json({
        success: true,
        source: 'mock',
        carts: [],
      });
    }

    const carts = await prisma.abandonedCart.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({
      success: true,
      source: 'database',
      carts,
    });
  } catch (error) {
    console.error('Error listando carritos abandonados:', error);
    return NextResponse.json(
      { error: 'Error al consultar carritos abandonados' },
      { status: 500 }
    );
  }
}

/**
 * POST: Disparar envío de correo de carrito abandonado con Resend
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { cartId, email, customerName, items, totalZeni, customRecipient } = body;

    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`;

    let targetCart = null;
    let recipientEmail = customRecipient || email;
    let recipientName = customerName || 'Explorador Hoi-Poi';
    let cartItems: AbandonedCartEmailItem[] = [];
    let cartTotal = 0;
    let recoveryToken = '';

    if (cartId && isPrismaConfigured()) {
      targetCart = await prisma.abandonedCart.findUnique({
        where: { id: cartId },
      });

      if (targetCart) {
        recipientEmail = customRecipient || targetCart.email;
        recipientName = targetCart.customerName || 'Explorador Hoi-Poi';
        cartItems = Array.isArray(targetCart.items)
          ? (targetCart.items as unknown as AbandonedCartEmailItem[])
          : [];
        cartTotal = targetCart.totalZeni;
        recoveryToken = targetCart.recoveryToken;
      }
    }

    // Si es simulación directa o no vino por ID
    if (!targetCart) {
      if (!recipientEmail || !recipientEmail.includes('@')) {
        return NextResponse.json(
          { error: 'Debe proporcionarse un correo de destinatario válido.' },
          { status: 400 }
        );
      }

      cartItems = items && Array.isArray(items) && items.length > 0
        ? items
        : [
            {
              name: 'Cápsula Hoi-Poi Moto Voladora No. 9',
              quantity: 1,
              unitPrice: 1250,
              image: null,
            },
            {
              name: 'Cápsula Hoi-Poi Refugio Portátil Capsule Corp',
              quantity: 2,
              unitPrice: 850,
              image: null,
            },
          ];

      cartTotal = Number(totalZeni) || cartItems.reduce((acc, it) => acc + it.unitPrice * it.quantity, 0);
      recoveryToken = crypto.randomBytes(16).toString('hex');

      // Guardar en base de datos si está conectada
      if (isPrismaConfigured()) {
        try {
          targetCart = await prisma.abandonedCart.create({
            data: {
              email: recipientEmail,
              customerName: recipientName,
              items: JSON.parse(JSON.stringify(cartItems)),
              totalZeni: cartTotal,
              recoveryToken,
              status: 'abandoned',
            },
          });
        } catch (dbErr) {
          console.warn('[abandoned-cart] Error guardando registro simulado:', dbErr);
        }
      }
    }

    const recoveryUrl = `${baseUrl}/?recover_cart=${recoveryToken}`;

    // Enviar correo transaccional de recuperación usando Resend
    const emailResult = await sendAbandonedCartEmail({
      to: recipientEmail,
      customerName: recipientName,
      items: cartItems,
      totalAmount: cartTotal,
      recoveryUrl,
      discountCode: 'HOIPOI10',
    });

    // Actualizar estado del carrito en base de datos
    if (targetCart && isPrismaConfigured()) {
      await prisma.abandonedCart.update({
        where: { id: targetCart.id },
        data: {
          emailSent: emailResult.success,
          emailSentAt: new Date(),
          status: 'abandoned',
        },
      });
    }

    return NextResponse.json({
      success: emailResult.success,
      emailId: emailResult.id,
      mocked: emailResult.mocked,
      recoveryUrl,
      message: emailResult.success
        ? `Correo de recuperación enviado exitosamente a ${recipientEmail}`
        : `Error al enviar correo: ${emailResult.error}`,
      error: emailResult.error,
    });
  } catch (error) {
    console.error('Error enviando correo de carrito abandonado:', error);
    return NextResponse.json(
      { error: 'Ocurrió un error al procesar el recordatorio de carrito abandonado' },
      { status: 500 }
    );
  }
}
