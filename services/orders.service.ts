/**
 * @file services/orders.service.ts
 * @description Servicio unificado para la gestión de órdenes de compra (Capsule Corp) y pedidos a plazos (Nenis).
 * @layer Service (API -> Service -> Component)
 */

import { api, ENDPOINTS } from '@/lib/api-client';
import {
  CapsuleOrder,
  OrdersStats,
  Pedido,
  PedidoEstado,
  CreatePedidoInput,
  UpdatePedidoInput,
} from '@/types/api';

export interface CapsuleOrdersResponse {
  orders: CapsuleOrder[];
  stats: OrdersStats;
  error?: string;
}

export interface CapsuleOrderUpdateResponse {
  success: boolean;
  order?: CapsuleOrder;
  error?: string;
}

export interface CapsuleOrderReceiptResponse {
  success: boolean;
  mocked?: boolean;
  error?: string;
}

export interface PedidosListResponse {
  success: boolean;
  total: number;
  data: Pedido[];
}

export interface PedidoMutationResponse {
  success: boolean;
  message: string;
  data: Pedido;
}

export interface PedidoDeleteResponse {
  success: boolean;
  message: string;
  deletedId: string;
}

export const ordersService = {
  // ─── ÓRDENES DE TIENDA CAPSULE CORP ───

  /**
   * Obtiene la lista de órdenes de compra con filtros opcionales de estado o término de búsqueda
   */
  async getCapsuleOrders(params?: {
    paymentStatus?: string;
    search?: string;
  }): Promise<CapsuleOrdersResponse> {
    return api.get(ENDPOINTS.CAPSULE_ORDERS, { params });
  },

  /**
   * Actualiza el estado de envío o pago de una orden de Capsule Corp
   */
  async updateCapsuleOrderStatus(payload: {
    id: string;
    status?: string;
    paymentStatus?: string;
  }): Promise<CapsuleOrderUpdateResponse> {
    return api.patch(ENDPOINTS.CAPSULE_ORDERS, payload);
  },

  /**
   * Envía o reenvía el comprobante de compra por correo con Resend
   */
  async sendCapsuleOrderReceipt(payload: {
    orderId: string;
    email: string;
  }): Promise<CapsuleOrderReceiptResponse> {
    return api.post(ENDPOINTS.CAPSULE_ORDERS, payload);
  },

  // ─── PEDIDOS A PLAZOS (NENIS) ───

  /**
   * Lista los pedidos a plazos con filtros de estado o término de búsqueda
   */
  async getPedidos(params?: {
    estado?: PedidoEstado;
    neniId?: string;
    search?: string;
  }): Promise<PedidosListResponse> {
    return api.get(ENDPOINTS.PEDIDOS, { params });
  },

  /**
   * Crea un nuevo pedido a plazos
   */
  async createPedido(input: CreatePedidoInput): Promise<PedidoMutationResponse> {
    return api.post(ENDPOINTS.PEDIDOS, input);
  },

  /**
   * Actualiza el estado o detalles de un pedido a plazos
   */
  async updatePedido(input: UpdatePedidoInput): Promise<PedidoMutationResponse> {
    return api.put(ENDPOINTS.PEDIDOS, input);
  },

  /**
   * Cancela o elimina un pedido a plazos por su ID
   */
  async deletePedido(id: string): Promise<PedidoDeleteResponse> {
    return api.delete(ENDPOINTS.PEDIDOS, {
      params: { id },
    });
  },
};
