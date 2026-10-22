/**
 * @file services/analytics.service.ts
 * @description Servicio de analítica de GA4, captura de leads y métricas internas.
 * @layer Service (API -> Service -> Component)
 */

import { api, ENDPOINTS } from '@/lib/api-client';
import { AnalyticsKPIsResponse, InternoMetricasResponse } from '@/types/api';

export interface SubmitLeadPayload {
  email: string;
  name?: string;
}

export interface SubmitLeadResponse {
  success: boolean;
  message: string;
}

export const analyticsService = {
  /**
   * Obtiene las métricas de KPIs de Google Analytics 4
   */
  async getKPIs(options?: { revalidate?: number | false }): Promise<AnalyticsKPIsResponse> {
    return api.get(ENDPOINTS.ANALYTICS_KPIS, {
      next: options?.revalidate !== undefined ? { revalidate: options.revalidate } : undefined,
    });
  },

  /**
   * Registra un nuevo lead o correo de contacto en la plataforma
   */
  async submitLead(payload: SubmitLeadPayload): Promise<SubmitLeadResponse> {
    return api.post(ENDPOINTS.LEADS, payload);
  },

  /**
   * Consulta las métricas de riesgo y auditoría del panel interno de operaciones
   */
  async getInternoMetricas(): Promise<InternoMetricasResponse> {
    return api.get(ENDPOINTS.INTERNO_METRICAS);
  },
};
