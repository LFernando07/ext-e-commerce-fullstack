/**
 * @file lib/db/pedidos.ts
 * @description Repositorio de pedidos conectado a Supabase PostgreSQL vía Prisma Singleton, con fallback en memoria.
 * 
 * @concept Prisma ORM, PostgreSQL Persistence, Graceful Fallback
 */

import { Pedido, PedidoEstado, CreatePedidoInput, UpdatePedidoInput } from '@/types/api';
import { prisma, isPrismaConfigured } from '@/lib/prisma';

// Base de datos simulada en memoria (fallback si DATABASE_URL aún no está configurada)
let pedidosDB: Pedido[] = [
  {
    id: 'ped_001',
    neniId: 'usr_neni_001',
    clienteNombre: 'Mariana Silva',
    concepto: 'Lote de 30 blusas artesanales y vestidos',
    monto: 3600,
    plazosQuincenas: 4,
    montoQuincenal: 900,
    estado: 'aprobado',
    fechaCreacion: '2026-10-10T14:30:00.000Z',
  },
  {
    id: 'ped_002',
    neniId: 'usr_neni_002',
    clienteNombre: 'Lucía Paredes',
    concepto: 'Harinas especiales y moldes de silicón repostería',
    monto: 1800,
    plazosQuincenas: 2,
    montoQuincenal: 900,
    estado: 'pendiente',
    fechaCreacion: '2026-10-12T09:15:00.000Z',
  },
  {
    id: 'ped_003',
    neniId: 'usr_neni_001',
    clienteNombre: 'Fernanda Ortiz',
    concepto: 'Caja surtida de accesorios y bisutería fina',
    monto: 4500,
    plazosQuincenas: 6,
    montoQuincenal: 750,
    estado: 'en_entrega',
    fechaCreacion: '2026-10-13T16:45:00.000Z',
  },
  {
    id: 'ped_004',
    neniId: 'usr_neni_003',
    clienteNombre: 'Camila Torres',
    concepto: 'Bolsas ecológicas y stickers con marca',
    monto: 1200,
    plazosQuincenas: 2,
    montoQuincenal: 600,
    estado: 'completado',
    fechaCreacion: '2026-10-08T11:00:00.000Z',
  },
];

export const pedidosRepository = {
  // GET (Listar con filtros opcionales)
  async getAll(filters?: { estado?: PedidoEstado; neniId?: string; search?: string }): Promise<Pedido[]> {
    if (isPrismaConfigured()) {
      try {
        const where: Record<string, unknown> = {};
        if (filters?.estado) where.estado = filters.estado;
        if (filters?.neniId) where.neniId = filters.neniId;
        if (filters?.search) {
          where.OR = [
            { concepto: { contains: filters.search, mode: 'insensitive' } },
            { clienteNombre: { contains: filters.search, mode: 'insensitive' } },
          ];
        }

        const rows = await prisma.pedido.findMany({
          where,
          orderBy: { fechaCreacion: 'desc' },
        });

        if (rows.length > 0) {
          return rows.map((r) => ({
            id: r.id,
            neniId: r.neniId,
            clienteNombre: r.clienteNombre,
            concepto: r.concepto,
            monto: r.monto,
            plazosQuincenas: r.plazosQuincenas,
            montoQuincenal: r.montoQuincenal,
            estado: r.estado as PedidoEstado,
            fechaCreacion: r.fechaCreacion.toISOString(),
          }));
        }
      } catch (e) {
        console.warn('[pedidos.ts] Fallback al leer pedidos de Prisma:', e);
      }
    }

    // Fallback en memoria
    let list = [...pedidosDB];
    if (filters?.estado) {
      list = list.filter((p) => p.estado === filters.estado);
    }
    if (filters?.neniId) {
      list = list.filter((p) => p.neniId === filters.neniId);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (p) =>
          p.concepto.toLowerCase().includes(q) ||
          p.clienteNombre.toLowerCase().includes(q)
      );
    }
    return list.sort(
      (a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime()
    );
  },

  // GET por ID
  async getById(id: string): Promise<Pedido | undefined> {
    if (isPrismaConfigured()) {
      try {
        const row = await prisma.pedido.findUnique({ where: { id } });
        if (row) {
          return {
            id: row.id,
            neniId: row.neniId,
            clienteNombre: row.clienteNombre,
            concepto: row.concepto,
            monto: row.monto,
            plazosQuincenas: row.plazosQuincenas,
            montoQuincenal: row.montoQuincenal,
            estado: row.estado as PedidoEstado,
            fechaCreacion: row.fechaCreacion.toISOString(),
          };
        }
      } catch (e) {
        console.warn('[pedidos.ts] Fallback al buscar pedido por id:', e);
      }
    }
    return pedidosDB.find((p) => p.id === id);
  },

  // POST (Crear nuevo pedido)
  async create(input: CreatePedidoInput): Promise<Pedido> {
    const quincenas = Math.max(1, input.plazosQuincenas || 2);
    const montoQuincenal = Math.round((Number(input.monto) / quincenas) * 100) / 100;

    if (isPrismaConfigured()) {
      try {
        const created = await prisma.pedido.create({
          data: {
            neniId: input.neniId || 'usr_neni_001',
            clienteNombre: input.clienteNombre.trim(),
            concepto: input.concepto.trim(),
            monto: Number(input.monto),
            plazosQuincenas: quincenas,
            montoQuincenal,
            estado: 'pendiente',
          },
        });

        return {
          id: created.id,
          neniId: created.neniId,
          clienteNombre: created.clienteNombre,
          concepto: created.concepto,
          monto: created.monto,
          plazosQuincenas: created.plazosQuincenas,
          montoQuincenal: created.montoQuincenal,
          estado: created.estado as PedidoEstado,
          fechaCreacion: created.fechaCreacion.toISOString(),
        };
      } catch (e) {
        console.warn('[pedidos.ts] Fallback al crear pedido en Prisma:', e);
      }
    }

    const newPedido: Pedido = {
      id: `ped_${Date.now().toString().slice(-6)}`,
      neniId: input.neniId || 'usr_neni_001',
      clienteNombre: input.clienteNombre.trim(),
      concepto: input.concepto.trim(),
      monto: Number(input.monto),
      plazosQuincenas: quincenas,
      montoQuincenal,
      estado: 'pendiente',
      fechaCreacion: new Date().toISOString(),
    };

    pedidosDB.unshift(newPedido);
    return newPedido;
  },

  // PUT (Actualizar pedido existente)
  async update(input: UpdatePedidoInput): Promise<Pedido | null> {
    if (isPrismaConfigured()) {
      try {
        const data: Record<string, unknown> = {};
        if (input.estado) data.estado = input.estado;
        if (input.concepto) data.concepto = input.concepto;
        if (input.monto !== undefined) {
          data.monto = Number(input.monto);
          // Recalcular monto quincenal
          const current = await prisma.pedido.findUnique({ where: { id: input.id } });
          const plazos = current?.plazosQuincenas || 2;
          data.montoQuincenal = Math.round((Number(input.monto) / plazos) * 100) / 100;
        }

        const updated = await prisma.pedido.update({
          where: { id: input.id },
          data,
        });

        return {
          id: updated.id,
          neniId: updated.neniId,
          clienteNombre: updated.clienteNombre,
          concepto: updated.concepto,
          monto: updated.monto,
          plazosQuincenas: updated.plazosQuincenas,
          montoQuincenal: updated.montoQuincenal,
          estado: updated.estado as PedidoEstado,
          fechaCreacion: updated.fechaCreacion.toISOString(),
        };
      } catch (e) {
        console.warn('[pedidos.ts] Fallback al actualizar pedido en Prisma:', e);
      }
    }

    const index = pedidosDB.findIndex((p) => p.id === input.id);
    if (index === -1) return null;

    const current = pedidosDB[index];
    const updated: Pedido = {
      ...current,
      estado: input.estado ?? current.estado,
      concepto: input.concepto ?? current.concepto,
      monto: input.monto !== undefined ? Number(input.monto) : current.monto,
      montoQuincenal:
        input.monto !== undefined
          ? Math.round((Number(input.monto) / current.plazosQuincenas) * 100) / 100
          : current.montoQuincenal,
    };

    pedidosDB[index] = updated;
    return updated;
  },

  // DELETE (Eliminar pedido)
  async delete(id: string): Promise<boolean> {
    if (isPrismaConfigured()) {
      try {
        await prisma.pedido.delete({ where: { id } });
        return true;
      } catch (e) {
        console.warn('[pedidos.ts] Fallback al eliminar pedido en Prisma:', e);
      }
    }

    const initialLen = pedidosDB.length;
    pedidosDB = pedidosDB.filter((p) => p.id !== id);
    return pedidosDB.length < initialLen;
  },
};
