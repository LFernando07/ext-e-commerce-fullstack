'use client';

import Link from 'next/link';
import {
  CookieConsentPreferences,
  saveStoredConsent,
} from '@/lib/consent';
import { useCookies } from '@/app/hooks/useCookies';


export default function CookieConsentBanner() {
  const {
    mounted,
    showBanner,
    setShowBanner,
    showModal,
    setShowModal,
    preferences,
    setPreferences,
  } = useCookies();

  const handleAcceptAll = () => {
    const allGranted: CookieConsentPreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
    };
    saveStoredConsent(allGranted);
    setPreferences(allGranted);
    setShowBanner(false);
    setShowModal(false);
  };

  const handleRejectNonEssential = () => {
    const essentialOnly: CookieConsentPreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
    };
    saveStoredConsent(essentialOnly);
    setPreferences(essentialOnly);
    setShowBanner(false);
    setShowModal(false);
  };

  const handleSavePreferences = () => {
    saveStoredConsent(preferences);
    setShowBanner(false);
    setShowModal(false);
  };

  if (!mounted) return null;

  return (
    <>
      {/* 1. Banner Inferior Flotante (Nenis Club Branding) */}
      {showBanner && !showModal && (
        <aside
          role="region"
          aria-label="Consentimiento de Cookies"
          className="fixed top-4 sm:top-0 left-6 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 p-6 bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-[#E2DFF5] transition-all duration-300 animate-in fade-in slide-in-from-bottom-5"
        >
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-[#5B3289]/10 text-[#5B3289] flex items-center justify-center text-xl shrink-0">
              🍪
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1.5 mb-1">
                <h2 className="font-display font-bold text-base text-[#1A1228]">
                  Tu privacidad nos importa
                </h2>
                <span className="text-[#DD4591] text-xs">♥</span>
              </div>
              
              <p className="font-body text-xs text-[#5E5C78] leading-relaxed">
                Utilizamos cookies propias y de terceros para medición analítica y mejorar tu experiencia. Puedes aceptarlas todas, rechazarlas o ajustar tus preferencias en cualquier momento.{' '}
                <Link
                  href="/cookies"
                  className="text-[#5B3289] font-medium hover:underline"
                >
                  Ver política
                </Link>
                .
              </p>

              {/* Botones de acción en píldora */}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="px-4 py-2 text-xs font-ui font-medium rounded-full bg-[#5B3289] hover:bg-[#302768] text-white transition-all shadow-sm active:scale-[0.98] cursor-pointer"
                >
                  Aceptar todas
                </button>
                <button
                  type="button"
                  onClick={handleRejectNonEssential}
                  className="px-4 py-2 text-xs font-ui font-medium rounded-full bg-[#FAF9FF] hover:bg-[#F1EFF9] text-[#1A1228] border border-[#E2DFF5] transition-colors cursor-pointer"
                >
                  Rechazar
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(true)}
                  className="px-2 py-1 text-xs font-ui text-[#5E5C78] hover:text-[#5B3289] underline transition-colors cursor-pointer"
                >
                  Configurar
                </button>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* 2. Modal de Preferencias Detalladas */}
      {showModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1228]/60 backdrop-blur-sm animate-in fade-in"
        >
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-[#E2DFF5] p-6 sm:p-7 max-h-[90vh] flex flex-col">
            
            {/* Header del Modal */}
            <div className="flex items-center justify-between pb-4 border-b border-[#E2DFF5]">
              <div className="flex items-center gap-2">
                <span className="text-xl">🍪</span>
                <h2 className="font-display font-bold text-lg text-[#1A1228]">
                  Preferencias de Cookies
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-[#FAF9FF] hover:bg-[#F1EFF9] text-[#5E5C78] hover:text-[#1A1228] flex items-center justify-center text-sm transition-colors cursor-pointer"
                aria-label="Cerrar modal"
              >
                ✕
              </button>
            </div>

            {/* Contenido / Categorías */}
            <div className="py-5 space-y-4 overflow-y-auto flex-1 font-body">
              <p className="text-xs text-[#5E5C78] leading-relaxed">
                Elige qué tecnologías permites mientras navegas en Nenis Club. Puedes consultar todos los detalles en nuestra{' '}
                <Link href="/cookies" className="text-[#5B3289] font-medium underline">
                  Política de Cookies
                </Link>
                .
              </p>

              {/* Categoría 1: Necesarias */}
              <div className="p-4 rounded-2xl bg-[#FAF9FF] border border-[#E2DFF5]">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-ui font-semibold text-sm text-[#1A1228] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#51BDC6]" />
                    Cookies Técnicas y Esenciales
                  </span>
                  <span className="text-[10px] font-ui uppercase font-semibold text-[#00A4BF] bg-[#51BDC6]/15 border border-[#51BDC6]/30 px-2 py-0.5 rounded-full">
                    Siempre activas
                  </span>
                </div>
                <p className="text-xs text-[#5E5C78] leading-relaxed">
                  Necesarias para que la plataforma funcione, mantener tu sesión de usuaria y recordar tus elecciones de privacidad.
                </p>
              </div>

              {/* Categoría 2: Analítica (GA4) */}
              <div className="p-4 rounded-2xl bg-white border border-[#E2DFF5] hover:border-[#5B3289]/40 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="pr-3">
                    <span className="font-ui font-semibold text-sm text-[#1A1228] flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#5B3289]" />
                      Cookies Analíticas (Google Analytics)
                    </span>
                    <p className="text-xs text-[#5E5C78] mt-1 leading-relaxed">
                      Nos ayudan a entender de forma anónima cuántas emprendedoras nos visitan y mejorar la plataforma con Google Consent Mode v2.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={(e) =>
                        setPreferences({ ...preferences, analytics: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[#E2DFF5] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5B3289]"></div>
                  </label>
                </div>
              </div>

              {/* Categoría 3: Marketing (Meta Pixel) */}
              <div className="p-4 rounded-2xl bg-white border border-[#E2DFF5] hover:border-[#DD4591]/40 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="pr-3">
                    <span className="font-ui font-semibold text-sm text-[#1A1228] flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#DD4591]" />
                      Cookies de Publicidad (Meta Pixel)
                    </span>
                    <p className="text-xs text-[#5E5C78] mt-1 leading-relaxed">
                      Nos permiten difundir convocatorias y avisos en Facebook e Instagram para que más nenis conozcan el financiamiento.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={preferences.marketing}
                      onChange={(e) =>
                        setPreferences({ ...preferences, marketing: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[#E2DFF5] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#DD4591]"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Footer con Botones del Modal */}
            <div className="pt-4 border-t border-[#E2DFF5] flex flex-wrap items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={handleRejectNonEssential}
                className="px-4 py-2.5 text-xs font-ui font-medium rounded-full bg-[#FAF9FF] hover:bg-[#F1EFF9] text-[#5E5C78] hover:text-[#1A1228] border border-[#E2DFF5] transition-colors cursor-pointer"
              >
                Rechazar opcionales
              </button>
              <button
                type="button"
                onClick={handleSavePreferences}
                className="px-4 py-2.5 text-xs font-ui font-medium rounded-full border border-[#5B3289] text-[#5B3289] hover:bg-[#5B3289]/5 transition-colors cursor-pointer"
              >
                Guardar selección
              </button>
              <button
                type="button"
                onClick={handleAcceptAll}
                className="px-5 py-2.5 text-xs font-ui font-medium rounded-full bg-[#5B3289] hover:bg-[#302768] text-white shadow-sm transition-all active:scale-[0.98] cursor-pointer"
              >
                Aceptar todas
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
