export interface AbandonedCartTemplateItem {
  name: string;
  quantity: number;
  unitPrice: number;
  image?: string | null;
}

export interface AbandonedCartTemplateParams {
  customerName: string;
  items: AbandonedCartTemplateItem[];
  totalAmount: number;
  recoveryUrl: string;
  discountCode?: string;
}

export function getAbandonedCartHtml(params: AbandonedCartTemplateParams): string {
  const {
    customerName,
    items,
    totalAmount,
    recoveryUrl,
    discountCode = 'HOIPOI10',
  } = params;

  const formattedTotal = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(totalAmount);

  // Asegurar que la URL lleve el cupón
  const finalRecoveryUrl = recoveryUrl.includes('coupon=')
    ? recoveryUrl
    : `${recoveryUrl}${recoveryUrl.includes('?') ? '&' : '?'}coupon=${discountCode}`;

  const itemsHtml = items
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #1E293B;">
        <td style="padding: 12px 8px; color: #F8FAFC; font-weight: 600; font-size: 14px;">
          ${item.name}
        </td>
        <td style="padding: 12px 8px; color: #38BDF8; text-align: center; font-size: 14px;">
          ${item.quantity}x
        </td>
        <td style="padding: 12px 8px; color: #F59E0B; text-align: right; font-weight: 600; font-size: 14px;">
          ${new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(item.unitPrice)}
        </td>
      </tr>
    `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="utf-8">
      <title>¡Tus cápsulas Hoi-Poi te esperan! - Capsule Corp</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #080B11; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #F8FAFC;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #080B11; padding: 40px 10px;">
        <tr>
          <td align="center">
            <table width="100%" max-width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #0F172A; border-radius: 24px; border: 1px solid #F59E0B33; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(245, 158, 11, 0.15);">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #D97706, #F59E0B); padding: 32px 24px; text-align: center;">
                  <div style="font-size: 38px; margin-bottom: 8px;">🛒⚡</div>
                  <h1 style="margin: 0; color: #080B11; font-size: 24px; font-weight: 900; letter-spacing: -0.5px;">
                    ¿OLVIDASTE TUS CÁPSULAS?
                  </h1>
                  <p style="margin: 4px 0 0 0; color: #080B11; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
                    Laboratorios Capsule Corp • Capital del Oeste
                  </p>
                </td>
              </tr>

              <!-- Contenido Principal -->
              <tr>
                <td style="padding: 32px 28px;">
                  <h2 style="margin: 0 0 12px 0; color: #F8FAFC; font-size: 20px; font-weight: 700;">
                    ¡Hola, ${customerName}!
                  </h2>
                  <p style="margin: 0 0 20px 0; color: #94A3B8; font-size: 14px; line-height: 1.6;">
                    Notamos que guardaste cápsulas de alta tecnología en tu carrito y no completaste tu orden. Hemos apartado tus artículos temporalmente para que nadie se quede con tu lote:
                  </p>

                  <!-- Desglose de Artículos -->
                  <div style="background-color: #1E293B; border-radius: 16px; padding: 18px; margin-bottom: 24px; border: 1px solid #334155;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                      <thead>
                        <tr style="border-bottom: 2px solid #334155; text-align: left; font-size: 11px; text-transform: uppercase; color: #64748B;">
                          <th style="padding: 8px 8px;">Cápsula Hoi-Poi</th>
                          <th style="padding: 8px 8px; text-align: center;">Cant.</th>
                          <th style="padding: 8px 8px; text-align: right;">Precio</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${itemsHtml}
                      </tbody>
                    </table>

                    <div style="border-top: 1px solid #334155; padding-top: 14px; margin-top: 12px;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="color: #94A3B8; font-size: 14px; font-weight: 600;">Total Reservado:</td>
                          <td style="color: #F59E0B; font-size: 20px; font-weight: 800; text-align: right; font-family: monospace;">
                            ${formattedTotal} MXN
                          </td>
                        </tr>
                      </table>
                    </div>
                  </div>

                  <!-- Banner de Cupón Especial -->
                  <div style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.1)); border: 1px dashed #F59E0B; border-radius: 16px; padding: 16px; margin-bottom: 28px; text-align: center;">
                    <span style="font-size: 11px; text-transform: uppercase; color: #FBBF24; font-weight: 700; letter-spacing: 1px;">Regalo especial de Bulma Brief</span>
                    <p style="margin: 6px 0 0 0; color: #F8FAFC; font-size: 14px; font-weight: 600;">
                      Usa el cupón <span style="background: #F59E0B; color: #080B11; padding: 2px 8px; border-radius: 6px; font-weight: 900; font-family: monospace;">${discountCode}</span> para un 10% de descuento adicional al reanudar tu compra.
                    </p>
                  </div>

                  <!-- Botón CTA de 1-Clic -->
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center">
                        <a href="${finalRecoveryUrl}" style="display: inline-block; background: linear-gradient(135deg, #F59E0B, #D97706); color: #080B11; font-weight: 900; font-size: 15px; text-decoration: none; padding: 16px 36px; border-radius: 9999px; box-shadow: 0 10px 20px -3px rgba(245, 158, 11, 0.4); text-transform: uppercase; letter-spacing: 0.5px;">
                          🚀 Recuperar Mi Carrito con 10% OFF
                        </a>
                      </td>
                    </tr>
                  </table>

                  <p style="text-align: center; color: #64748B; font-size: 12px; margin-top: 16px;">
                    O visita directamente: <a href="${finalRecoveryUrl}" style="color: #38BDF8; word-break: break-all;">${finalRecoveryUrl}</a>
                  </p>

                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #0B1120; padding: 20px 24px; text-align: center; border-top: 1px solid #1E293B;">
                  <p style="margin: 0; color: #64748B; font-size: 11px; line-height: 1.5;">
                    Notificación transaccional automática de Capsule Corp Store.<br>
                    Next.js 16 • Supabase PostgreSQL • Resend API
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}
