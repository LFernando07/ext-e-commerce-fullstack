export interface OrderTemplateItem {
  name: string;
  quantity: number;
  unitPrice: number;
  image?: string | null;
}

export interface OrderConfirmationTemplateParams {
  orderCode: string;
  customerName: string;
  address?: string;
  totalAmount: number;
  paymentMethod: string;
  items: OrderTemplateItem[];
}

export function getOrderConfirmationHtml(params: OrderConfirmationTemplateParams): string {
  const { orderCode, customerName, address, totalAmount, paymentMethod, items } = params;

  const formattedTotal = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(totalAmount);

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
      <title>Confirmación de Pedido - Capsule Corp</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #080B11; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #F8FAFC;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #080B11; padding: 40px 10px;">
        <tr>
          <td align="center">
            <table width="100%" max-width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #0F172A; border-radius: 24px; border: 1px solid #00E5FF33; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 229, 255, 0.15);">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #0284C7, #06B6D4); padding: 32px 24px; text-align: center;">
                  <div style="font-size: 36px; margin-bottom: 8px;">💊</div>
                  <h1 style="margin: 0; color: #080B11; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">
                    CAPSULE CORP STORE
                  </h1>
                  <p style="margin: 4px 0 0 0; color: #080B11; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                    Tecnología Hoi-Poi • Despacho Inmediato
                  </p>
                </td>
              </tr>

              <!-- Contenido Principal -->
              <tr>
                <td style="padding: 32px 28px;">
                  <h2 style="margin: 0 0 12px 0; color: #F8FAFC; font-size: 20px; font-weight: 700;">
                    ¡Gracias por tu compra, ${customerName}!
                  </h2>
                  <p style="margin: 0 0 24px 0; color: #94A3B8; font-size: 14px; line-height: 1.6;">
                    Hemos confirmado tu pago y tus cápsulas Hoi-Poi están en proceso de preparación en los laboratorios de la Capital del Oeste.
                  </p>

                  <!-- Caja de Referencia -->
                  <div style="background-color: #1E293B; border-radius: 16px; padding: 18px; margin-bottom: 28px; border: 1px solid #334155;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 13px;">
                      <tr>
                        <td style="color: #94A3B8; padding-bottom: 8px;">Código de Orden:</td>
                        <td style="color: #38BDF8; font-weight: 700; font-family: monospace; text-align: right; padding-bottom: 8px;">
                          ${orderCode}
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #94A3B8; padding-bottom: 8px;">Método de Pago:</td>
                        <td style="color: #F8FAFC; font-weight: 600; text-align: right; padding-bottom: 8px;">
                          ${paymentMethod}
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #94A3B8;">Destino de Envío:</td>
                        <td style="color: #F8FAFC; text-align: right;">
                          ${address || 'Capital del Oeste, Tierra'}
                        </td>
                      </tr>
                    </table>
                  </div>

                  <!-- Desglose de Artículos -->
                  <h3 style="margin: 0 0 14px 0; color: #F8FAFC; font-size: 15px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                    Resumen de Cápsulas Hoi-Poi
                  </h3>
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px; border-collapse: collapse;">
                    <thead>
                      <tr style="border-bottom: 2px solid #334155; text-align: left; font-size: 11px; text-transform: uppercase; color: #64748B;">
                        <th style="padding: 8px 8px;">Artículo</th>
                        <th style="padding: 8px 8px; text-align: center;">Cant.</th>
                        <th style="padding: 8px 8px; text-align: right;">Precio</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${itemsHtml}
                    </tbody>
                  </table>

                  <!-- Total -->
                  <div style="border-top: 2px solid #00E5FF33; padding-top: 16px; margin-bottom: 28px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="color: #94A3B8; font-size: 16px; font-weight: 600;">Total Facturado:</td>
                        <td style="color: #F59E0B; font-size: 22px; font-weight: 800; text-align: right; font-family: monospace;">
                          ${formattedTotal} MXN
                        </td>
                      </tr>
                    </table>
                  </div>

                  <!-- Botón de Rastreo -->
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center">
                        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #00E5FF, #0284C7); color: #080B11; font-weight: 800; font-size: 14px; text-decoration: none; padding: 14px 32px; border-radius: 9999px; box-shadow: 0 10px 15px -3px rgba(0, 229, 255, 0.3);">
                          Ver Estado de la Orden
                        </a>
                      </td>
                    </tr>
                  </table>

                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #0B1120; padding: 20px 24px; text-align: center; border-top: 1px solid #1E293B;">
                  <p style="margin: 0; color: #64748B; font-size: 11px; line-height: 1.5;">
                    Este es un comprobante electrónico generado por Capsule Corp E-Commerce Store.<br>
                    Next.js 16 • Supabase • Stripe Sandbox • Resend
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
