import Stripe from 'stripe';

/**
 * Instancia Singleton de Stripe para Node.js / Server Actions / Route Handlers.
 * En modo sandbox, utiliza las claves de prueba (sk_test_...).
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  typescript: true,
  appInfo: {
    name: 'Capsule Corp Store',
    version: '1.0.0',
  },
});

/**
 * Validador para saber si Stripe está configurado con credenciales válidas
 */
export const isStripeConfigured = (): boolean => {
  const key = process.env.STRIPE_SECRET_KEY;
  return Boolean(key && key.startsWith('sk_'));
};
