import { getStoredConsent } from '@/lib/consent';
import { NenisUser } from '@/lib/auth/users';

// Tipado rápido para evitar advertencias de TypeScript con window
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

// Evento: Registro o Lead completado (formulario de landing)
export const trackLeadSubmission = (leadType = 'landing_signup') => {
  if (typeof window !== 'undefined') {
    const consent = getStoredConsent();
    // Respetar consentimiento
    if (consent && !consent.analytics) return;

    // GA4
    if (window.gtag) {
      window.gtag('event', 'generate_lead', {
        lead_source: leadType,
      });
    }
    // Meta Pixel
    if (consent?.marketing && window.fbq) {
      window.fbq('track', 'Lead', {
        content_name: leadType,
      });
    }
  }
};

// Evento: Clic en llamado a la acción (ej. botón de WhatsApp o registro)
export const trackCTAClick = (ctaName: string) => {
  if (typeof window !== 'undefined') {
    const consent = getStoredConsent();
    if (consent && !consent.analytics) return;

    // GA4
    if (window.gtag) {
      window.gtag('event', 'cta_click', {
        button_name: ctaName,
      });
    }
    // Meta Pixel
    if (consent?.marketing && window.fbq) {
      window.fbq('trackCustom', 'CTAClick', {
        button: ctaName,
      });
    }
  }
};

// Evento & User Properties: Login de usuario verificado
export const trackUserLogin = (user: Omit<NenisUser, 'password'>) => {
  if (typeof window === 'undefined') return;

  const consent = getStoredConsent();

  // 1. REGLA DE PRIVACIDAD: Solo enviar a GA4 si el usuario dio consentimiento analítico
  if (!consent || !consent.analytics) {
    console.log('[Analytics] Usuario autenticado, pero consentimiento analítico no otorgado. No se envían user_properties a GA4.');
    return;
  }

  // 2. Establecer User Properties en Google Analytics 4
  if (window.gtag) {
    window.gtag('set', 'user_properties', {
      user_id: user.id,
      user_level: user.graduationLevel,
      business_category: user.businessCategory,
      role: user.role,
    });

    window.gtag('event', 'login', {
      method: 'credentials',
      user_level: user.graduationLevel,
    });
  }

  // 3. Meta Pixel (si tiene consentimiento de marketing)
  if (consent.marketing && window.fbq) {
    window.fbq('trackCustom', 'UserLogin', {
      user_level: user.graduationLevel,
      business_category: user.businessCategory,
    });
  }
};

// Evento: Cierre de sesión
export const trackUserLogout = () => {
  if (typeof window === 'undefined') return;
  const consent = getStoredConsent();
  if (!consent || !consent.analytics) return;

  if (window.gtag) {
    window.gtag('event', 'logout');
  }
};

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

/**
 * Evento GA4 Estándar: 'purchase' (Compra Exitosa)
 * Registra ingresos, ID de transacción, método de pago y desglose para GA4 e-commerce.
 */
export const trackPurchase = (payload: PurchaseTrackPayload) => {
  if (typeof window === 'undefined') return;
  const consent = getStoredConsent();
  if (consent && !consent.analytics) return;

  const currency = payload.currency || 'MXN';

  // 1. GA4 E-Commerce Event
  if (window.gtag) {
    window.gtag('event', 'purchase', {
      transaction_id: payload.transaction_id,
      value: payload.value,
      currency,
      payment_type: payload.payment_method || 'stripe_sandbox',
      items: payload.items?.map((it) => ({
        item_id: String(it.item_id),
        item_name: it.item_name,
        price: it.price,
        quantity: it.quantity || 1,
      })),
    });
    console.log('[GA4] Evento "purchase" enviado con éxito:', payload.transaction_id);
  }

  // 2. Meta Pixel Purchase Event
  if (consent?.marketing && window.fbq) {
    window.fbq('track', 'Purchase', {
      value: payload.value,
      currency,
      content_type: 'product',
      contents: payload.items?.map((it) => ({
        id: it.item_id,
        quantity: it.quantity || 1,
      })),
    });
  }
};

/**
 * Evento GA4 Personalizado: 'purchase_failed' (Compra Fallida o Cancelada)
 * Permite a los analistas medir la tasa de abandono y fallas en la pasarela.
 */
export const trackPurchaseFailure = (data: {
  transaction_id?: string;
  error_message?: string;
  payment_method?: string;
  reason?: 'user_cancelled' | 'card_declined' | 'system_error';
}) => {
  if (typeof window === 'undefined') return;
  const consent = getStoredConsent();
  if (consent && !consent.analytics) return;

  if (window.gtag) {
    window.gtag('event', 'purchase_failed', {
      transaction_id: data.transaction_id || 'unknown',
      error_message: data.error_message || 'Transacción no completada',
      payment_type: data.payment_method || 'stripe_sandbox',
      failure_reason: data.reason || 'system_error',
    });
    console.log('[GA4] Evento "purchase_failed" enviado:', data);
  }
};