/**
 * @file services/cart.service.ts
 * @description Servicio de carrito y recuperación de carritos abandonados.
 * @layer Service (API -> Service -> Component)
 */

import { api, ENDPOINTS } from '@/lib/api-client';
import { AbandonedCart } from '@/types/api';
import { AbandonedCartEmailItem } from '@/lib/email';

export interface CartSyncItem {
  productId: number;
  name: string;
  priceInZeni: number;
  quantity: number;
  image?: string | null;
}

export interface SyncCartPayload {
  items: CartSyncItem[];
  totalZeni: number;
  email?: string;
  customerName?: string;
  userId?: string;
}

export interface SyncCartResponse {
  success: boolean;
  cartId?: string;
  recoveryToken?: string;
  mocked?: boolean;
  message?: string;
  error?: string;
}

export interface RecoverCartResponse {
  success: boolean;
  cart?: {
    id: string;
    email: string;
    customerName: string;
    items: unknown[];
    totalZeni: number;
    recoveryToken: string;
  };
  error?: string;
}

export interface AbandonOrderResponse {
  success: boolean;
  recoveryToken?: string;
  recoveryUrl?: string;
  emailSent?: boolean;
  emailId?: string;
  message?: string;
  mocked?: boolean;
  error?: string;
}

export interface AbandonedCartsResponse {
  success: boolean;
  source?: string;
  carts?: AbandonedCart[];
  error?: string;
}

export interface SendAbandonedReminderPayload {
  cartId?: string;
  email?: string;
  customerName?: string;
  items?: AbandonedCartEmailItem[];
  totalZeni?: number;
  customRecipient?: string;
}

export interface SendAbandonedReminderResponse {
  success: boolean;
  mocked?: boolean;
  recoveryUrl?: string;
  error?: string;
}

export const cartService = {
  /**
   * Sincroniza el carrito local con Supabase/Prisma para persistencia
   */
  async syncCart(payload: SyncCartPayload): Promise<SyncCartResponse> {
    return api.post(ENDPOINTS.CART_SYNC, payload);
  },

  /**
   * Recupera el contenido de un carrito abandonado a partir de su token único
   */
  async recoverCart(token: string): Promise<RecoverCartResponse> {
    return api.get(ENDPOINTS.CART_RECOVER, {
      params: { token },
    });
  },

  /**
   * Registra una compra cancelada/abandonada y envía correo con Resend
   */
  async abandonOrder(orderCode: string): Promise<AbandonOrderResponse> {
    return api.post(ENDPOINTS.CART_ABANDON_ORDER, { orderCode });
  },

  /**
   * Obtiene la lista de carritos abandonados para el panel de administración
   */
  async getAbandonedCarts(): Promise<AbandonedCartsResponse> {
    return api.get(ENDPOINTS.CART_ABANDONED);
  },

  /**
   * Envía recordatorio con cupón de descuento por correo mediante Resend
   */
  async sendAbandonedReminder(
    payload: SendAbandonedReminderPayload
  ): Promise<SendAbandonedReminderResponse> {
    return api.post(ENDPOINTS.CART_ABANDONED, payload);
  },
};
