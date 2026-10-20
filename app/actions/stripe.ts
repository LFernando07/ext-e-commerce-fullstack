'use server';

/**
 * @file app/actions/stripe.ts
 * @description Server Action para generar sesiones de pago con Stripe Checkout (Sandbox / Modo Pruebas).
 */

import { stripe, isStripeConfigured } from '@/lib/stripe';
import { prisma, isPrismaConfigured } from '@/lib/prisma';
import { ECommerceProduct } from '@/types/dragonball';

interface StripeCheckoutPayload {
  customerName: string;
  address: string;
  items: Array<{ product: ECommerceProduct; quantity: number }>;
}

export interface StripeCheckoutResult {
  success: boolean;
  url?: string;
  orderCode?: string;
  error?: string;
  message?: string;
}

/**
 * Crea una sesión de Stripe Checkout en modo Sandbox
 */
export async function createStripeCheckoutSession(
  payload: StripeCheckoutPayload
): Promise<StripeCheckoutResult> {
  const { customerName, address, items } = payload;

  if (!customerName || customerName.trim().length < 3) {
    return {
      success: false,
      error: 'INVALID_NAME',
      message: 'Ingresa un nombre de cliente válido (mínimo 3 caracteres).',
    };
  }

  if (!items || items.length === 0) {
    return {
      success: false,
      error: 'EMPTY_CART',
      message: 'El carrito está vacío. Agrega guerreros para continuar.',
    };
  }

  // Si aún no ha configurado sus credenciales en .env.local, damos retroalimentación clara
  if (!isStripeConfigured()) {
    return {
      success: false,
      error: 'STRIPE_NOT_CONFIGURED',
      message:
        'Stripe Sandbox no está configurado. Por favor ingresa tu STRIPE_SECRET_KEY (sk_test_...) en .env.local.',
    };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const orderCode = `CC-STRIPE-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)}`;

  // Cálculo de totales en Zeni
  const totalZeni = items.reduce(
    (acc, item) => acc + item.product.priceInZeni * item.quantity,
    0
  );
  const totalUnits = items.reduce((acc, item) => acc + item.quantity, 0);

  try {
    // 1. Guardar la orden inicial en Supabase vía Prisma con estatus 'pending'
    if (isPrismaConfigured()) {
      await prisma.capsuleOrder.create({
        data: {
          orderCode,
          customerName,
          address: address || 'Capital del Oeste, Tierra',
          paymentMethod: 'Stripe Sandbox (Tarjeta)',
          paymentStatus: 'pending',
          totalZeni,
          itemsPurchased: totalUnits,
          status: 'despachado',
          items: {
            create: items.map((i) => ({
              productId: i.product.id,
              name: i.product.name,
              quantity: i.quantity,
              unitPrice: i.product.priceInZeni,
              image: i.product.image,
            })),
          },
        },
      });
    }

    // 2. Mapear cada cápsula a un Line Item de Stripe
    // Conversión de Zeni a Centavos MXN (ej: 100 Zeni = $10.00 MXN -> 1000 centavos)
    const line_items = items.map((item) => {
      // 100 Zeni -> 10 MXN = 1000 centavos
      const unitAmountInCents = Math.max(
        1000,
        Math.round((item.product.priceInZeni / 10) * 100)
      );

      return {
        price_data: {
          currency: 'mxn',
          product_data: {
            name: `Cápsula Hoi-Poi: ${item.product.name}`,
            description: `${item.product.race} | Poder Ki: ${item.product.ki} | Nivel: ${item.product.powerTier}`,
            images: item.product.image && item.product.image.startsWith('http')
              ? [item.product.image]
              : undefined,
          },
          unit_amount: unitAmountInCents,
        },
        quantity: item.quantity,
      };
    });

    // 3. Crear sesión con Stripe Checkout (métodos automáticos activados por Stripe Dashboard)
    const session = await stripe.checkout.sessions.create({
      line_items,
      mode: 'payment',
      customer_email: undefined,
      metadata: {
        orderCode,
        customerName,
        totalZeni: totalZeni.toString(),
      },
      success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order_code=${orderCode}`,
      cancel_url: `${appUrl}/checkout/cancel?order_code=${orderCode}`,
    });

    // 4. Asociar stripeSessionId a la orden en Supabase
    if (isPrismaConfigured() && session.id) {
      await prisma.capsuleOrder.update({
        where: { orderCode },
        data: { stripeSessionId: session.id },
      });
    }

    return {
      success: true,
      url: session.url || undefined,
      orderCode,
    };
  } catch (error: unknown) {
    const err = error as Error;
    console.error('[actions/stripe.ts] Error al crear sesión de Stripe Checkout:', err);
    return {
      success: false,
      error: 'STRIPE_ERROR',
      message: err.message || 'Error al comunicarse con la pasarela de Stripe Sandbox.',
    };
  }
}
