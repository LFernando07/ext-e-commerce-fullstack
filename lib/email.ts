import { Resend } from 'resend';
import { getOrderConfirmationHtml } from './email/templates/order-confirmation';
import { getWelcomeHtml } from './email/templates/welcome';
import { getPasswordResetHtml } from './email/templates/password-reset';
import { getAbandonedCartHtml } from './email/templates/abandoned-cart';
import {
  SendAbandonedCartEmailPayload,
  SendBasicEmailPayload,
  SendOrderEmailPayload,
  SendWelcomeEmailPayload,
  SendPasswordResetEmailPayload,
  AbandonedCartEmailItem,
  OrderEmailItem,
} from '@/types/email';

export type {
  SendAbandonedCartEmailPayload,
  SendBasicEmailPayload,
  SendOrderEmailPayload,
  SendWelcomeEmailPayload,
  SendPasswordResetEmailPayload,
  AbandonedCartEmailItem,
  OrderEmailItem,
};

/**
 * Instancia Singleton de Resend para envío de correos transaccionales
 */
export const resend = new Resend(process.env.RESEND_API_KEY || '');

/**
 * Valida si Resend cuenta con una API key válida
 */
export const isResendConfigured = (): boolean => {
  const key = process.env.RESEND_API_KEY;
  return Boolean(key && key.startsWith('re_') && !key.includes('tu_api_key'));
};



/**
 * Envía el correo de confirmación de compra con recibo detallado de Capsule Corp
 */
export async function sendOrderConfirmationEmail(payload: SendOrderEmailPayload) {
  const { to, orderCode, customerName, address, totalAmount, paymentMethod, items } = payload;

  if (!to || !to.includes('@')) {
    console.warn('[email] Dirección de correo inválida o ausente:', to);
    return { success: false, error: 'Email inválido' };
  }

  if (!isResendConfigured()) {
    console.log(
      `[email:sandbox-mock] Resend no configurado. Simulación de confirmación para ${to} (Orden ${orderCode}, Total: $${totalAmount} MXN)`
    );
    return {
      success: true,
      mocked: true,
      message: 'Simulado en consola (configura RESEND_API_KEY en .env.local para envíos reales)',
    };
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL || 'Capsule Corp <onboarding@resend.dev>';
  const htmlContent = getOrderConfirmationHtml({
    orderCode,
    customerName,
    address,
    totalAmount,
    paymentMethod,
    items,
  });

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [to],
      subject: `¡Cápsulas en camino! Confirmación de Orden ${orderCode}`,
      html: htmlContent,
    });

    if (error) {
      console.error('[email] Error devuelto por Resend API:', error);
      return { success: false, error: error.message };
    }

    console.log(`[email] Correo enviado exitosamente a ${to} con ID: ${data?.id}`);
    return { success: true, id: data?.id };
  } catch (err: unknown) {
    const error = err as Error;
    console.error('[email] Excepción al enviar correo con Resend:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Envía correo de bienvenida tras registro de usuario
 */
export async function sendWelcomeEmail(payload: SendWelcomeEmailPayload) {
  const { to, name } = payload;
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'Capsule Corp <onboarding@resend.dev>';

  if (!isResendConfigured()) {
    console.log(`[email:sandbox-mock] Bienvenida simulada en consola para ${to} (${name})`);
    return { success: true, mocked: true };
  }

  const html = getWelcomeHtml({ name });

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [to],
      subject: `¡Bienvenido a Capsule Corp, ${name}! 🚀`,
      html,
    });
    if (error) return { success: false, error: error.message };
    return { success: true, id: data?.id };
  } catch (err: unknown) {
    return { success: false, error: (err as Error).message };
  }
}

/**
 * Envía correo con token para restablecimiento de contraseña
 */
export async function sendPasswordResetEmail(payload: SendPasswordResetEmailPayload) {
  const { to, name, resetUrl } = payload;
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'Capsule Corp <onboarding@resend.dev>';

  if (!isResendConfigured()) {
    console.log(`[email:sandbox-mock] Enlace de recuperación para ${to}: ${resetUrl}`);
    return { success: true, mocked: true, resetUrl };
  }

  const html = getPasswordResetHtml({ name, resetUrl });

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [to],
      subject: 'Restablecimiento de contraseña • Capsule Corp',
      html,
    });
    if (error) return { success: false, error: error.message };
    return { success: true, id: data?.id };
  } catch (err: unknown) {
    return { success: false, error: (err as Error).message };
  }
}

/**
 * Envía correo transaccional de Carrito Abandonado invitando a completar la compra de cápsulas
 */
export async function sendAbandonedCartEmail(payload: SendAbandonedCartEmailPayload) {
  const { to, customerName, items, totalAmount, recoveryUrl, discountCode = 'HOIPOI10' } = payload;
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'Capsule Corp <onboarding@resend.dev>';

  if (!to || !to.includes('@')) {
    console.warn('[email:abandoned-cart] Correo inválido:', to);
    return { success: false, error: 'Email inválido' };
  }

  if (!isResendConfigured()) {
    const formattedTotal = new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(totalAmount);
    console.log(
      `[email:sandbox-mock] Carrito abandonado simulado para ${to} (${customerName}): Total ${formattedTotal}. Enlace: ${recoveryUrl}`
    );
    return { success: true, mocked: true, recoveryUrl };
  }

  const html = getAbandonedCartHtml({
    customerName,
    items,
    totalAmount,
    recoveryUrl,
    discountCode,
  });

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [to],
      subject: `¡Tus cápsulas Hoi-Poi te esperan! Reserva activa 💊`,
      html,
    });

    if (error) {
      console.error('[email:abandoned-cart] Error devuelto por Resend API:', error);
      return { success: false, error: error.message };
    }

    console.log(`[email:abandoned-cart] Correo enviado exitosamente a ${to} con ID: ${data?.id}`);
    return { success: true, id: data?.id };
  } catch (err: unknown) {
    const error = err as Error;
    console.error('[email:abandoned-cart] Excepción al enviar correo con Resend:', error);
    return { success: false, error: error.message };
  }
}
