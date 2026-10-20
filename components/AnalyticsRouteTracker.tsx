'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';

function RouteTracker() {
    // Uso de hooks de next/navigation para rastrear la ruta y los parámetros de búsqueda
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const url = `${pathname}${searchParams?.toString() ? `?${searchParams.toString()}` : ''}`;

    if (typeof window !== 'undefined') {
      // 1. Registrar visita en GA4
      if (window.gtag) {
        window.gtag('event', 'page_view', {
          page_path: url,
          page_location: window.location.href,
          page_title: document.title,
        });
      }

      // 2. Registrar PageView en Meta Pixel
      if (window.fbq) {
        window.fbq('track', 'PageView');
      }
    }
  }, [pathname, searchParams]);

  return null;
}

export default function AnalyticsRouteTracker() {
  return (
    <Suspense fallback={null}>
      <RouteTracker />
    </Suspense>
  );
}