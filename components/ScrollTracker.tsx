'use client';

import { useEffect, useRef } from 'react';

export default function ScrollTracker() {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const hasTriggeredRef = useRef<boolean>(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Disparar solo una vez cuando el usuario llega al fondo
        if (entry.isIntersecting && !hasTriggeredRef.current) {
          hasTriggeredRef.current = true;

          if (typeof window !== 'undefined') {
            // Evento para GA4
            if (window.gtag) {
              window.gtag('event', 'scroll_bottom', {
                event_category: 'engagement',
                event_label: 'Landing Bottom Reached',
                percent_scrolled: 100,
              });
            }

            // Evento personalizado para Meta Pixel
            if (window.fbq) {
              window.fbq('trackCustom', 'ScrollToBottom', {
                page: window.location.pathname,
              });
            }
          }

          // Una vez disparado, desconectamos el observador
          observer.disconnect();
        }
      },
      {
        threshold: 0.1, // Se activa en cuanto asoma el pie de página
      }
    );

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return <div ref={sentinelRef} className="w-full h-1 pointer-events-none" aria-hidden="true" />;
}