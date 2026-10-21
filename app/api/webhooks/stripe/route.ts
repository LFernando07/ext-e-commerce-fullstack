import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma, isPrismaConfigured } from '@/lib/prisma';
import { sendOrderConfirmationEmail, sendAbandonedCartEmail, AbandonedCartEmailItem } from '@/lib/email';
import Stripe from 'stripe';
import crypto from 'crypto';

/**
 * Route Handler para Webhooks de Stripe (POST /api/webhooks/stripe)
 * Escucha eventos asíncronos como `checkout.session.completed` para confirmar el pago en Supabase.
 */
export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Falta el encabezado stripe-signature.' },
      { status: 400 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event: Stripe.Event;

  try {
    if (webhookSecret && webhookSecret.startsWith('whsec_')) {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } else {
      // Si aún no se configura whsec en local, deserializamos el evento directamente
      event = JSON.parse(body) as Stripe.Event;
      console.warn(
        '[webhooks/stripe] STRIPE_WEBHOOK_SECRET no configurado. Evento procesado sin verificación criptográfica estricta.'
      );
    }
  } catch (err: unknown) {
    const error = err as Error;
    console.error(`[webhooks/stripe] Error validando firma del webhook: ${error.message}`);
    return NextResponse.json(
      { error: `Webhook Signature Error: ${error.message}` },
      { status: 400 }
    );
  }

  // Manejo de eventos específicos de Stripe
  switch (event.type) {
    case 'checkout.session.completed':
    case 'checkout.session.async_payment_succeeded': {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderCode = session.metadata?.orderCode;
      const paymentIntentId =
        typeof session.payment_intent === 'string'
          ? session.payment_intent
          : session.payment_intent?.id;

      console.log(`[webhooks/stripe] ✅ Pago confirmado para la orden: ${orderCode || session.id}`);

      if (isPrismaConfigured()) {
        try {
          let updatedOrder = null;
          if (orderCode) {
            updatedOrder = await prisma.capsuleOrder.update({
              where: { orderCode },
              data: {
                paymentStatus: 'paid',
                stripePaymentIntentId: paymentIntentId || null,
              },
              include: { items: true },
            });
          } else if (session.id) {
            updatedOrder = await prisma.capsuleOrder.update({
              where: { stripeSessionId: session.id },
              data: {
                paymentStatus: 'paid',
                stripePaymentIntentId: paymentIntentId || null,
              },
              include: { items: true },
            });
          }

          // Enviar confirmación de pedido vía Resend
          const customerEmail = session.customer_details?.email;
          if (customerEmail && updatedOrder) {
            await sendOrderConfirmationEmail({
              to: customerEmail,
              orderCode: updatedOrder.orderCode,
              customerName: updatedOrder.customerName,
              address: updatedOrder.address,
              totalAmount: updatedOrder.totalZeni,
              paymentMethod: 'Stripe Sandbox (Tarjeta)',
              items: updatedOrder.items,
            });
          }
        } catch (dbErr) {
          console.error('[webhooks/stripe] Error actualizando orden en Supabase:', dbErr);
        }
      }
      break;
    }

    case 'checkout.session.expired': {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderCode = session.metadata?.orderCode;
      console.log(`[webhooks/stripe] ⏳ Sesión de Stripe Checkout abandonada/expirada: ${orderCode || session.id}`);

      if (isPrismaConfigured()) {
        try {
          const order = orderCode
            ? await prisma.capsuleOrder.findUnique({
                where: { orderCode },
                include: { items: true },
              })
            : await prisma.capsuleOrder.findFirst({
                where: { stripeSessionId: session.id },
                include: { items: true },
              });

          if (order && order.paymentStatus !== 'paid') {
            await prisma.capsuleOrder.update({
              where: { id: order.id },
              data: { paymentStatus: 'abandoned' },
            });

            // Correo del cliente desde Stripe o metadata
            const customerEmail =
              session.customer_details?.email ||
              session.customer_email ||
              session.metadata?.customerEmail;

            const effectiveEmail = customerEmail || 'lfbp5000@gmail.com';
            const recoveryToken = crypto.randomBytes(16).toString('hex');

            const cartItems: AbandonedCartEmailItem[] = order.items.map((i) => ({
              name: i.name,
              quantity: i.quantity,
              unitPrice: i.unitPrice,
              image: i.image,
            }));

            const abandonedCart = await prisma.abandonedCart.create({
              data: {
                email: effectiveEmail,
                customerName: order.customerName,
                items: JSON.parse(JSON.stringify(cartItems)),
                totalZeni: order.totalZeni,
                recoveryToken,
                status: 'abandoned',
              },
            });

            const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
            const recoveryUrl = `${appUrl}/?recover_cart=${recoveryToken}`;

            const emailResult = await sendAbandonedCartEmail({
              to: effectiveEmail,
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
          }
        } catch (dbErr) {
          console.error('[webhooks/stripe] Error procesando checkout.session.expired:', dbErr);
        }
      }
      break;
    }

    case 'checkout.session.async_payment_failed':
    case 'payment_intent.payment_failed': {
      const obj = event.data.object as { id?: string; metadata?: Record<string, string> };
      console.warn(`[webhooks/stripe] ❌ Pago fallido para el identificador: ${obj.id}`);
      if (isPrismaConfigured() && obj.metadata?.orderCode) {
        try {
          await prisma.capsuleOrder.update({
            where: { orderCode: obj.metadata.orderCode },
            data: { paymentStatus: 'failed' },
          });
        } catch (dbErr) {
          console.error('[webhooks/stripe] Error marcando orden como fallida:', dbErr);
        }
      }
      break;
    }

    case 'charge.refunded': {
      const charge = event.data.object as Stripe.Charge;
      console.log(`[webhooks/stripe] ↩️ Reembolso procesado para charge: ${charge.id}`);
      if (isPrismaConfigured() && charge.payment_intent) {
        const paymentIntentId =
          typeof charge.payment_intent === 'string'
            ? charge.payment_intent
            : charge.payment_intent.id;
        try {
          await prisma.capsuleOrder.updateMany({
            where: { stripePaymentIntentId: paymentIntentId },
            data: { paymentStatus: 'refunded', status: 'entregado' },
          });
        } catch (dbErr) {
          console.error('[webhooks/stripe] Error marcando orden como reembolsada:', dbErr);
        }
      }
      break;
    }

    default:
      console.log(`[webhooks/stripe] Evento no gestionado: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
