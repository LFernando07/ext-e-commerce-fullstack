/**
 * @file services/cache.service.ts
 * @description Servicio para purga y revalidación de caché (Data Cache y Full Route Cache).
 * @layer Service (API -> Service -> Component)
 */

import { api, ENDPOINTS } from '@/lib/api-client';
import { RevalidateAction, RevalidateResponse } from '@/types/api';

export const cacheService = {
  /**
   * Dispara una solicitud para purgar o revalidar caché en el servidor
   */
  async revalidate(action: RevalidateAction, target: string): Promise<RevalidateResponse> {
    return api.post(ENDPOINTS.CACHE_REVALIDATE, { action, target });
  },
};
