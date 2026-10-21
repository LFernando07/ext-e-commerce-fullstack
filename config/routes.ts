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
  checkoutSuccess: '/checkout/success' as Route,
  checkoutCancel: '/checkout/cancel' as Route,
  resetPassword: '/auth/reset-password' as Route,
  sentryTest: '/sentry-test' as Route,
} as const;

/**
 * Mapeo de rutas a nombres descriptivos de página para Google Analytics 4
 */
export const ROUTE_TITLES: Record<string, string> = {
  '/': 'Tienda & Inicio | Capsule Corp Store',
  '/about': 'Sobre Nosotros | Capsule Corp',
  '/cache-demo': 'Laboratorio de Caché (PPR & Turbopack)',
  '/cookies': 'Política de Cookies y Privacidad',
  '/dashboard': 'Mi Espacio de Usuario',
  '/interno': 'Módulo Interno de Operaciones',
  '/checkout/success': 'Confirmación de Compra Exitosa',
  '/checkout/cancel': 'Orden Cancelada / Carrito Abandonado',
  '/auth/reset-password': 'Recuperar Contraseña de Cuenta',
  '/sentry-test': 'Prueba de Monitoreo con Sentry',
};

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
