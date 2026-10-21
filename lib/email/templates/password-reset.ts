export interface PasswordResetTemplateParams {
  name: string;
  resetUrl: string;
}

export function getPasswordResetHtml(params: PasswordResetTemplateParams): string {
  const { name, resetUrl } = params;

  return `
    <!DOCTYPE html>
    <html lang="es">
    <body style="margin: 0; padding: 30px; background-color: #080B11; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #F8FAFC;">
      <div style="max-width: 540px; margin: 0 auto; background: #0F172A; border: 1px solid #EF444433; border-radius: 20px; padding: 32px; text-align: center;">
        <div style="font-size: 40px; margin-bottom: 12px;">🔐</div>
        <h1 style="color: #F8FAFC; margin: 0 0 12px 0; font-size: 20px;">Restablecer tu Contraseña</h1>
        <p style="color: #94A3B8; font-size: 14px; line-height: 1.6;">
          Hola, <strong>${name}</strong>. Recibimos una solicitud para restablecer la contraseña de tu cuenta en Capsule Corp.
        </p>
        <p style="color: #94A3B8; font-size: 13px;">
          Haz clic en el siguiente botón para definir tu nueva contraseña. Este enlace expira en <strong>1 hora</strong>:
        </p>
        <div style="margin: 28px 0;">
          <a href="${resetUrl}" style="background: linear-gradient(135deg, #EF4444, #F97316); color: #FFFFFF; font-weight: bold; text-decoration: none; padding: 14px 32px; border-radius: 9999px; font-size: 14px; display: inline-block;">
            Restablecer Contraseña
          </a>
        </div>
        <p style="color: #64748B; font-size: 11px; margin-top: 24px;">
          Si no solicitaste este cambio, puedes ignorar este mensaje de forma segura.<br>
          Enlace directo: <a href="${resetUrl}" style="color: #38BDF8;">${resetUrl}</a>
        </p>
      </div>
    </body>
    </html>
  `;
}
