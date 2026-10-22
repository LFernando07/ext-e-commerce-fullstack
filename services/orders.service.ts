/**
 * @file services/orders.service.ts
 * @description Servicio para la gestión de órdenes de compra de Capsule Corp (Stripe & Supabase).
 * @layer Service (API -> Service -> Component)
 */

import { api, ENDPOINTS } from '@/lib/api-client';
import { CapsuleOrder, OrdersStats } from '@/types/api';

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

export const ordersService = {
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
};
