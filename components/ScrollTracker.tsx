'use client';

import { useScroll } from '@/app/hooks/useScroll';

export default function ScrollTracker() {
  const { sentinelRef } = useScroll();

  return <div ref={sentinelRef} className="w-full h-1 pointer-events-none" aria-hidden="true" />;
}