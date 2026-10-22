import { NenisUser } from "@/lib/auth/users";
import { CartItem, ECommerceProduct } from "./dragonball";

export interface SearchParamsProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    race?: string;
  }>;
}

// Tipado rápido para evitar advertencias de TypeScript con window
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

// ─── E-COMMERCE TRACKING (GA4 & Meta Pixel) ───
export interface PurchaseTrackPayload {
  transaction_id: string;
  value: number;
  currency?: string;
  payment_method?: string;
  items_count?: number;
  items?: Array<{
    item_id: string | number;
    item_name: string;
    price?: number;
    quantity?: number;
  }>;
}

export interface PurchaseTrackerFailedPayload {
  transaction_id?: string;
  error_message?: string;
  payment_method?: string;
  reason?: 'user_cancelled' | 'card_declined' | 'system_error';
}

// Autenticacion
export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  businessName?: string;
  businessCategory?: string;
}

export interface AuthContextType {
  user: Omit<NenisUser, 'password'> | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (payload: RegisterPayload) => Promise<{ success: boolean; error?: string }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message?: string; error?: string; devResetUrl?: string }>;
  logout: () => Promise<void>;
}

// Carrito de compras
export interface CartCoupon {
  code: string;
  discountPercent: number;
}

export interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addToCart: (product: ECommerceProduct, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  restoreCart: (items: CartItem[]) => void;
  coupon: CartCoupon | null;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  discountAmount: number;
  discountedTotalZeni: number;
  totalZeni: number;
  totalItems: number;
}