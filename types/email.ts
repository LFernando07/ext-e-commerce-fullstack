import { AbandonedCartTemplateItem } from "@/lib/email/templates/abandoned-cart";
import { OrderTemplateItem } from "@/lib/email/templates/order-confirmation";

export type OrderEmailItem = OrderTemplateItem;
export type AbandonedCartEmailItem = AbandonedCartTemplateItem;

export interface SendOrderEmailPayload {
  to: string;
  orderCode: string;
  customerName: string;
  address?: string;
  totalAmount: number;
  paymentMethod: string;
  items: OrderEmailItem[];
}

export interface SendAbandonedCartEmailPayload {
  to: string;
  customerName: string;
  items: AbandonedCartEmailItem[];
  totalAmount: number;
  recoveryUrl: string;
  discountCode?: string;
}

export interface SendWelcomeEmailPayload {
  to: string;
  name: string;
}

export interface SendPasswordResetEmailPayload {
  to: string;
  name: string;
  resetUrl: string;
}

export type SendBasicEmailPayload = SendPasswordResetEmailPayload;