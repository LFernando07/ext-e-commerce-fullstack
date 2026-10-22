import { CookieConsentPreferences, getStoredConsent, applyConsent } from "@/lib/consent";
import { useState, useEffect } from "react";

const OPEN_PREFERENCES_EVENT = process.env.NEXT_PUBLIC_OPEN_PREFERENCES_EVENT;

export function useCookies() {
  const [mounted, setMounted] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Estados de las preferencias en el modal
  const [preferences, setPreferences] = useState<CookieConsentPreferences>({
    necessary: true,
    analytics: true,
    marketing: true,
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const existing = getStoredConsent();

    if (!existing) {
      // Primera visita: mostrar el banner
      setShowBanner(true);
    } else {
      // Ya tenía preferencias guardadas: aplicarlas a GA4 y Meta
      setPreferences(existing);
      applyConsent(existing);
    }

    // Escuchar el evento cuando la usuaria haga clic en "Preferencias de cookies"
    const handleOpenPreferences = () => {
      const current = getStoredConsent() || {
        necessary: true,
        analytics: true,
        marketing: true,
      };
      setPreferences(current);
      setShowModal(true);
    };

    if (OPEN_PREFERENCES_EVENT) {
      window.addEventListener(OPEN_PREFERENCES_EVENT, handleOpenPreferences);
    }
    return () => {
      if (OPEN_PREFERENCES_EVENT) {
        window.removeEventListener(
          OPEN_PREFERENCES_EVENT,
          handleOpenPreferences,
        );
      }
    };
  }, []);

  return {
    mounted,
    showBanner,
    setShowBanner,
    showModal,
    setShowModal,
    preferences,
    setPreferences,
  }
}
