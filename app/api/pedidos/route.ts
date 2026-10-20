/**
 * @file app/api/pedidos/route.ts
 * @description API Route para gestión de pedidos a plazos (CRUD) conectado a Prisma/Supabase.
 * 
 * @concept Next.js Route Handlers, Prisma ORM, REST API
 */

import { NextResponse } from 'next/server';
import { pedidosRepository } from '@/lib/db/pedidos';
import { CreatePedidoInput, PedidoEstado, UpdatePedidoInput } from '@/types/api';

// ── GET: /api/pedidos ──
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const estado = searchParams.get('estado') as PedidoEstado | undefined;
    const neniId = searchParams.get('neniId') || undefined;
    const search = searchParams.get('search') || undefined;

    const data = await pedidosRepository.getAll({ estado, neniId, search });

    return NextResponse.json({
      success: true,
      total: data.length,
      data,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: (err as Error).message || 'Error al obtener pedidos' },
      { status: 500 }
    );
  }
}

// ── POST: /api/pedidos ──
export async function POST(request: Request) {
  try {
    const body: CreatePedidoInput = await request.json();

    if (!body.clienteNombre || !body.concepto || !body.monto) {
      return NextResponse.json(
        { success: false, error: 'Faltan campos obligatorios: clienteNombre, concepto y monto' },
        { status: 400 }
      );
    }

    if (isNaN(Number(body.monto)) || Number(body.monto) <= 0) {
      return NextResponse.json(
        { success: false, error: 'El monto debe ser un número positivo' },
        { status: 400 }
      );
    }

    const newPedido = await pedidosRepository.create(body);

    return NextResponse.json(
      {
        success: true,
        message: 'Pedido a plazos creado exitosamente',
        data: newPedido,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: (err as Error).message || 'Error al crear pedido' },
      { status: 500 }
    );
  }
}

// ── PUT: /api/pedidos ──
export async function PUT(request: Request) {
  try {
    const body: UpdatePedidoInput = await request.json();

    if (!body.id) {
      return NextResponse.json(
        { success: false, error: 'Se requiere el id del pedido a actualizar' },
        { status: 400 }
      );
    }

    const updated = await pedidosRepository.update(body);

    if (!updated) {
      return NextResponse.json(
        { success: false, error: `No se encontró el pedido con id: ${body.id}` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Pedido actualizado correctamente',
      data: updated,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: (err as Error).message || 'Error al actualizar pedido' },
      { status: 500 }
    );
  }
}

// ── DELETE: /api/pedidos ──
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Debes proporcionar el parámetro ?id=...' },
        { status: 400 }
      );
    }

    const deleted = await pedidosRepository.delete(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: `No se encontró el pedido con id: ${id}` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Pedido cancelado/eliminado correctamente',
      deletedId: id,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: (err as Error).message || 'Error al eliminar pedido' },
      { status: 500 }
    );
  }
}
