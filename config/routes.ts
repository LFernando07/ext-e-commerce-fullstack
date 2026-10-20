import type { Route } from 'next';

/**
 * Rutas de páginas de la aplicación
 */
export const paths = {
  landing: {
    home: '/' as Route,
    about: '/about' as Route,
    help: '/help' as Route,
    contact: '/contact' as Route,
    blog: '/blog' as Route,
  },
  dashboard: '/dashboard' as Route,
  cookies: '/cookies' as Route,
  interno: '/interno' as Route,
  cacheDemo: '/cache-demo' as Route,
} as const;

/**
 * Rutas de la API fuertemente tipadas (Single Source of Truth)
 * Evita strings mágicos hardcodeados en llamadas fetch
 */
export const API_ROUTES = {
  PEDIDOS: '/api/pedidos',
  AUTH_ME: '/api/auth/me',
  AUTH_LOGIN: '/api/auth/login',
  AUTH_LOGOUT: '/api/auth/logout',
  LEADS: '/api/leads',
  INTERNO_METRICAS: '/api/interno/metricas',
} as const;

export type ApiRoute = (typeof API_ROUTES)[keyof typeof API_ROUTES];
