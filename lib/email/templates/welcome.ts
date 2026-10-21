export interface WelcomeTemplateParams {
  name: string;
}

export function getWelcomeHtml(params: WelcomeTemplateParams): string {
  const { name } = params;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  return `
    <!DOCTYPE html>
    <html lang="es">
    <body style="margin: 0; padding: 30px; background-color: #080B11; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #F8FAFC;">
      <div style="max-width: 540px; margin: 0 auto; background: #0F172A; border: 1px solid #00E5FF33; border-radius: 20px; padding: 32px; text-align: center;">
        <div style="font-size: 40px; margin-bottom: 12px;">Capsule Corp 💊</div>
        <h1 style="color: #00E5FF; margin: 0 0 12px 0; font-size: 22px;">¡Bienvenido/a, ${name}!</h1>
        <p style="color: #94A3B8; font-size: 14px; line-height: 1.6;">
          Tu cuenta ha sido creada con éxito en la plataforma de <strong>Capsule Corp E-Commerce</strong>.
          Ya puedes acceder a tu panel de control, explorar el catálogo y disfrutar de compras en Pesos Mexicanos con Stripe.
        </p>
        <div style="margin: 28px 0;">
          <a href="${appUrl}/dashboard" style="background: linear-gradient(135deg, #00E5FF, #0284C7); color: #080B11; font-weight: bold; text-decoration: none; padding: 12px 28px; border-radius: 9999px; font-size: 14px; display: inline-block;">
            Ir a Mi Espacio
          </a>
        </div>
        <p style="color: #64748B; font-size: 11px; margin: 0;">Enviado automáticamente por Resend API.</p>
      </div>
    </body>
    </html>
  `;
}
