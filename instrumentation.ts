import * as Sentry from '@sentry/nextjs';

// Funcion para registrar la configuración de Sentry según el entorno de ejecución (Node.js o Edge)
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}

// Función para capturar errores de solicitud y enviarlos a Sentry
export const onRequestError = Sentry.captureRequestError;
