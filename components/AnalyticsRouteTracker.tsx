'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import { trackPageView } from '@/lib/analytics';
import { ROUTE_TITLES } from '@/config/routes';


function RouteTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const url = `${pathname}${searchParams?.toString() ? `?${searchParams.toString()}` : ''}`;

    let pageTitle = ROUTE_TITLES[pathname];
    if (!pageTitle && pathname.startsWith('/personajes/')) {
      const id = pathname.split('/')[2];
      pageTitle = `Detalle de Guerrero #${id} | Capsule Corp`;
    }
    if (!pageTitle) {
      pageTitle = typeof document !== 'undefined' && document.title ? document.title : 'Capsule Corp';
    }
    trackPageView(url, pageTitle);
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