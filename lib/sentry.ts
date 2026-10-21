import * as Sentry from '@sentry/nextjs';

/**
 * Reporta un error o excepción a Sentry con etiquetas y contexto adicional.
 * Ideal para capturar fallos en Server Actions, pasarelas de pago y webhooks.
 */
export function logErrorToSentry(
  error: unknown,
  context?: {
    tags?: Record<string, string>;
    extra?: Record<string, unknown>;
    user?: { id?: string; email?: string; username?: string };
  }
) {
  Sentry.withScope((scope) => {
    if (context?.tags) {
      Object.entries(context.tags).forEach(([key, value]) => {
        scope.setTag(key, value);
      });
    }
    if (context?.extra) {
      Object.entries(context.extra).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
    }
    if (context?.user) {
      scope.setUser(context.user);
    }
    Sentry.captureException(error);
  });
}

/**
 * Dispara un error de prueba para verificar la integración con Sentry.
 */
export function triggerSentryTestError() {
  try {
    throw new Error('🧪 Capsule Corp Sentry Test Error - Verificando monitoreo en DEV');
  } catch (err) {
    logErrorToSentry(err, {
      tags: { source: 'sentry-test-button', environment: process.env.NODE_ENV || 'development' },
      extra: { timestamp: new Date().toISOString() },
    });
    console.info('🧪 Error de prueba registrado en Sentry (ver consola / dashboard)');
    return true;
  }
}
