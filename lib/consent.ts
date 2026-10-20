export interface CookieConsentPreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

const CONSENT_STORAGE_KEY = process.env.NEXT_PUBLIC_CONSENT_STORAGE_KEY;
const OPEN_PREFERENCES_EVENT = process.env.NEXT_PUBLIC_OPEN_PREFERENCES_EVENT;

export function getStoredConsent(): CookieConsentPreferences | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!CONSENT_STORAGE_KEY) {
      console.warn('CONSENT_STORAGE_KEY no está definido en las variables de entorno.');
      return null;
    }
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveStoredConsent(preferences: CookieConsentPreferences): void {
  if (typeof window === 'undefined') return;
  try {
    if (!CONSENT_STORAGE_KEY) {
      console.warn('CONSENT_STORAGE_KEY no está definido en las variables de entorno.');
      return;
    }
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(preferences));
    applyConsent(preferences);

    // Enviar evento de medición de consentimiento a GA4
    if (window.gtag) {
      const isAcceptedAll = preferences.analytics && preferences.marketing;
      const isRejectedAll = !preferences.analytics && !preferences.marketing;
      const choiceType = isAcceptedAll
        ? 'accepted_all'
        : isRejectedAll
        ? 'rejected_all'
        : 'customized';

      window.gtag('event', 'cookie_consent_choice', {
        consent_choice: choiceType,
        analytics_granted: preferences.analytics,
        marketing_granted: preferences.marketing,
      });
    }
  } catch (e) {
    console.error('Error guardando preferencias de cookies:', e);
  }
}

export function applyConsent(preferences: CookieConsentPreferences): void {
  if (typeof window === 'undefined') return;

  // 1. Google Consent Mode v2 (GA4)
  if (window.gtag) {
    window.gtag('consent', 'update', {
      analytics_storage: preferences.analytics ? 'granted' : 'denied',
      ad_storage: preferences.marketing ? 'granted' : 'denied',
      ad_user_data: preferences.marketing ? 'granted' : 'denied',
      ad_personalization: preferences.marketing ? 'granted' : 'denied',
    });
  }

  // 2. Meta Pixel (Facebook)
  if (window.fbq) {
    window.fbq('consent', preferences.marketing ? 'grant' : 'revoke');
  }
}

export function openConsentPreferences(): void {
  if (typeof window === 'undefined') return;
  if (!OPEN_PREFERENCES_EVENT) {
    console.warn('OPEN_PREFERENCES_EVENT no está definido en las variables de entorno.');
    return;
  }
  window.dispatchEvent(new CustomEvent(OPEN_PREFERENCES_EVENT));
}
