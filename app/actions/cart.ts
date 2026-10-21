'use server';

/**
 * @file app/actions/cart.ts
 * @description Server Actions para la gestión del carrito y procesamiento de pedidos de Capsule Corp.
 * 
 * @concept Next.js Server Actions ('use server'), Form Actions, revalidatePath, revalidateTag
 * 
 * ¿Qué son las Server Actions en Next.js?
 * ─────────────────────────────────────────────────────────────────────────────
 * Son funciones asíncronas que se ejecutan EXCLUSIVAMENTE en el servidor.
 * Pueden ser invocadas directamente desde componentes cliente (mediante formularios `<form action={...}>`,
 * hooks como `useActionState`, o controladores de eventos `onClick`).
 * 
 * Beneficios pedagógicos aprendidos aquí:
 * 1. Cero endpoints manuales de API REST: No necesitas crear `route.ts` con `req/res` para una mutación simple.
 * 2. Progressive Enhancement: Los formularios HTML pueden funcionar incluso si JavaScript aún no se ha cargado.
 * 3. Revalidación Integrada: Llamar a `revalidatePath` o `revalidateTag` después de una mutación actualiza
 *    el caché del servidor y actualiza la UI de forma atómica en el mismo ciclo.
 * 4. Seguridad: Los secretos, validaciones de stock y pasarelas de pago se ejecutan en Node/Edge sin exponerse al browser.
 */

import { revalidatePath, revalidateTag } from 'next/cache';
import { cookies } from 'next/headers';
import { CheckoutResult, ECommerceProduct } from '@/types/dragonball';
import { prisma, isPrismaConfigured } from '@/lib/prisma';

// Simulación de base de datos en memoria (fallback si DATABASE_URL aún no está configurada)
interface DBZOrder {
  orderId: string;
  customerName: string;
  address: string;
  paymentMethod: string;
  items: Array<{ productId: number; name: string; quantity: number; unitPrice: number }>;
  totalZeni: number;
  createdAt: string;
}

const capsuleOrdersDb: DBZOrder[] = [];

/**
 * Server Action para procesar la orden de compra de cápsulas Hoi-Poi
 * 
 * Esta función está diseñada para ser utilizada con el hook `useActionState` de React 19:
 * `const [state, formAction, isPending] = useActionState(checkoutAction, initialState);`
 * 
 * @param prevState - Estado previo retornado por la acción (requerido por useActionState)
 * @param formData - Datos serializados enviados desde el formulario HTML
 * @returns CheckoutResult con el estatus y número de orden generado
 */
export async function checkoutAction(
  prevState: CheckoutResult,
  formData: FormData
): Promise<CheckoutResult> {
  // 1. Validar Autenticación Requerida (Regla de negocio: sólo usuarios logueados pueden comprar)
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('nenis_session');
  if (!sessionCookie?.value) {
    return {
      success: false,
      message: 'Debes iniciar sesión o registrarte para completar tu pedido de cápsulas.',
      error: 'AUTH_REQUIRED',
    };
  }

  // 2. Extracción de parámetros desde FormData
  const customerName = (formData.get('customerName') as string)?.trim();
  const address = (formData.get('address') as string)?.trim() || 'Capital del Oeste, Tierra';
  const paymentMethod = (formData.get('paymentMethod') as string) || 'Zeni en Efectivo';
  const rawItems = formData.get('itemsPayload') as string;
  const couponCode = (formData.get('couponCode') as string)?.trim() || '';
  const discountPercent = Number(formData.get('discountPercent')) || 0;

  // 3. Validación en el Servidor (Server-Side Validation)
  if (!customerName || customerName.length < 3) {
    return {
      success: false,
      message: 'El nombre del cliente debe tener al menos 3 caracteres.',
      error: 'INVALID_NAME',
    };
  }

  if (!rawItems) {
    return {
      success: false,
      message: 'Tu cápsula transportadora está vacía. Añade al menos un guerrero.',
      error: 'EMPTY_CART',
    };
  }

  let parsedItems: Array<{ product: ECommerceProduct; quantity: number }> = [];
  try {
    parsedItems = JSON.parse(rawItems);
    if (!Array.isArray(parsedItems) || parsedItems.length === 0) {
      throw new Error('Payload inválido');
    }
  } catch {
    return {
      success: false,
      message: 'Los datos del pedido están corruptos. Intenta nuevamente.',
      error: 'MALFORMED_ITEMS',
    };
  }

  // 4. Simulación de procesamiento de pago y verificación de Ki (Server latency)
  await new Promise((resolve) => setTimeout(resolve, 800));

  // 5. Cálculo del total en el servidor aplicando cupón si existe
  const discountMultiplier = discountPercent > 0 ? 1 - discountPercent / 100 : 1;
  const rawTotalZeni = parsedItems.reduce(
    (acc, item) => acc + item.product.priceInZeni * item.quantity,
    0
  );
  const totalZeni = Math.round(rawTotalZeni * discountMultiplier);
  const totalUnits = parsedItems.reduce((acc, item) => acc + item.quantity, 0);

  // 6. Creación del registro de pedido Capsule Corp
  const orderId = `CC-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)}`;
  const effectivePaymentMethod = couponCode
    ? `${paymentMethod} (Cupón ${couponCode} -${discountPercent}%)`
    : paymentMethod;

  const orderRecord: DBZOrder = {
    orderId,
    customerName,
    address,
    paymentMethod: effectivePaymentMethod,
    items: parsedItems.map((i) => ({
      productId: i.product.id,
      name: i.product.name,
      quantity: i.quantity,
      unitPrice: Math.round(i.product.priceInZeni * discountMultiplier),
    })),
    totalZeni,
    createdAt: new Date().toISOString(),
  };

  // 7. Persistencia: Si Supabase está configurado con DATABASE_URL, guardamos en PostgreSQL con Prisma
  if (isPrismaConfigured()) {
    try {
      await prisma.capsuleOrder.create({
        data: {
          orderCode: orderId,
          customerName,
          address,
          paymentMethod: effectivePaymentMethod,
          totalZeni,
          itemsPurchased: totalUnits,
          status: 'despachado',
          items: {
            create: parsedItems.map((i) => ({
              productId: i.product.id,
              name: i.product.name,
              quantity: i.quantity,
              unitPrice: i.product.priceInZeni,
              image: i.product.image,
            })),
          },
        },
      });
    } catch (dbError) {
      console.warn('[actions/cart.ts] No se pudo guardar en Supabase PostgreSQL, usando fallback en memoria:', dbError);
      capsuleOrdersDb.push(orderRecord);
    }
  } else {
    capsuleOrdersDb.push(orderRecord);
  }

  // 6. Invalidation del Cache de Next.js (Revalidation)
  // Revalidamos la ruta principal y los personajes para actualizar stock en caso de haber cambios
  revalidatePath('/');
  revalidatePath('/personajes/[id]', 'page');
  revalidateTag('dbz-characters', { expire: 0 });

  return {
    success: true,
    orderId,
    customerName,
    totalZeni,
    itemsPurchased: totalUnits,
    message: `¡Compra exitosa! La Capsule Corp ha despachado ${totalUnits} cápsula(s) Hoi-Poi a nombre de ${customerName}.`,
  };
}

/**
 * Server Action para consultar el historial de órdenes recientes generadas
 */
export async function getRecentCapsuleOrders(): Promise<DBZOrder[]> {
  if (isPrismaConfigured()) {
    try {
      const orders = await prisma.capsuleOrder.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { items: true },
      });
      if (orders.length > 0) {
        return orders.map((o) => ({
          orderId: o.orderCode,
          customerName: o.customerName,
          address: o.address,
          paymentMethod: o.paymentMethod,
          totalZeni: o.totalZeni,
          createdAt: o.createdAt.toISOString(),
          items: o.items.map((it) => ({
            productId: it.productId,
            name: it.name,
            quantity: it.quantity,
            unitPrice: it.unitPrice,
          })),
        }));
      }
    } catch (e) {
      console.warn('[actions/cart.ts] Fallback al leer órdenes recientes:', e);
    }
  }
  return [...capsuleOrdersDb].reverse().slice(0, 5);
}
