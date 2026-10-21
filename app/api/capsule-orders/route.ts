import { NextRequest, NextResponse } from 'next/server';
import { prisma, isPrismaConfigured } from '@/lib/prisma';
import { sendOrderConfirmationEmail } from '@/lib/email';

/**
 * Route Handler para listar y gestionar órdenes de compra de Capsule Corp (GET /api/capsule-orders)
 */
export async function GET(req: NextRequest) {
  if (!isPrismaConfigured()) {
    return NextResponse.json(
      { error: 'Prisma/Supabase no está configurado.' },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(req.url);
  const statusFilter = searchParams.get('paymentStatus'); // 'all' | 'paid' | 'pending' | 'failed'
  const search = searchParams.get('search')?.trim();

  try {
    const whereClause: Record<string, unknown> = {};

    if (statusFilter && statusFilter !== 'all') {
      whereClause.paymentStatus = statusFilter;
    }

    if (search) {
      whereClause.OR = [
        { orderCode: { contains: search, mode: 'insensitive' } },
        { customerName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orders = await prisma.capsuleOrder.findMany({
      where: whereClause,
      include: {
        items: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    });

    // Métricas rápidas calculadas en el servidor
    const totalRevenue = orders
      .filter((o) => o.paymentStatus === 'paid')
      .reduce((acc, o) => acc + o.totalZeni, 0);

    const paidCount = orders.filter((o) => o.paymentStatus === 'paid').length;
    const pendingCount = orders.filter((o) => o.paymentStatus === 'pending').length;

    return NextResponse.json({
      orders,
      stats: {
        totalOrders: orders.length,
        totalRevenue,
        paidCount,
        pendingCount,
      },
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('[api/capsule-orders] Error consultando órdenes:', err);
    return NextResponse.json(
      { error: 'Error al consultar órdenes en Supabase: ' + err.message },
      { status: 500 }
    );
  }
}

/**
 * Actualiza el estado de una orden (PATCH /api/capsule-orders)
 */
export async function PATCH(req: NextRequest) {
  if (!isPrismaConfigured()) {
    return NextResponse.json({ error: 'Base de datos no configurada' }, { status: 503 });
  }

  try {
    const body = await req.json();
    const { id, status, paymentStatus } = body;

    if (!id) {
      return NextResponse.json({ error: 'El ID de la orden es requerido' }, { status: 400 });
    }

    const updateData: Record<string, string> = {};
    if (status) updateData.status = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;

    const updated = await prisma.capsuleOrder.update({
      where: { id },
      data: updateData,
      include: { items: true },
    });

    return NextResponse.json({ success: true, order: updated });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * Enviar o reenviar correo de confirmación con Resend (POST /api/capsule-orders)
 */
export async function POST(req: NextRequest) {
  if (!isPrismaConfigured()) {
    return NextResponse.json({ error: 'Base de datos no configurada' }, { status: 503 });
  }

  try {
    const body = await req.json();
    const { orderId, email } = body;

    if (!orderId || !email) {
      return NextResponse.json(
        { error: 'Se requiere el orderId y el correo electrónico del destinatario' },
        { status: 400 }
      );
    }

    const order = await prisma.capsuleOrder.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 });
    }

    const result = await sendOrderConfirmationEmail({
      to: email,
      orderCode: order.orderCode,
      customerName: order.customerName,
      address: order.address,
      totalAmount: order.totalZeni,
      paymentMethod: order.paymentMethod,
      items: order.items,
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
