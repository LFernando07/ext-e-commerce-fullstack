/**
 * @file services/sentry.service.ts
 * @description Servicio de pruebas y monitoreo de errores con Sentry.
 * @layer Service (API -> Service -> Component)
 */

import { api, ENDPOINTS } from '@/lib/api-client';
import { SentryTestResponse } from '@/types/api';

export const sentryService = {
  /**
   * Invoca el endpoint de prueba de errores del servidor para verificar captura en Sentry
   */
  async triggerServerError(): Promise<SentryTestResponse> {
    return api.get(ENDPOINTS.SENTRY_TEST);
  },
};
