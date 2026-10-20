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