/**
 * @file services/index.ts
 * @description Punto de entrada unificado para la capa de servicios de Capsule Corp.
 * Arquitectura: API Client (lib/api-client) -> Services (services/*) -> Components/Contexts
 */

export * from './auth.service';
export * from './orders.service';
export * from './cart.service';
export * from './analytics.service';
export * from './cache.service';
export * from './sentry.service';
