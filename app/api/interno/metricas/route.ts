import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('nenis_session');

  // Si no hay cookie de sesión, el módulo interno bloquea el acceso
  if (!sessionCookie?.value) {
    return NextResponse.json(
      {
        success: false,
        error: 'Acceso no autorizado al módulo interno. Debes iniciar sesión.',
      },
      { status: 401 }
    );
  }

  try {
    const user = JSON.parse(sessionCookie.value);

    // Métrica confidencial interna de la plataforma
    const metricasInternas = {
      totalCarteraColocada: 385400,
      tasaRecuperacion: 98.4,
      nenisActivas: 148,
      solicitudesPendientes: 9,
      nivelRiesgoGeneral: 'Bajo (Controlado)',
    };

    return NextResponse.json({
      success: true,
      data: metricasInternas,
      auditoria: {
        usuario: user.name,
        email: user.email,
        rol: user.role,
        metodoAutenticacion: 'Cookie de sesión compartida en mismo dominio (Path=/)',
        cookieOrigen: 'nenis_session',
        horaAcceso: new Date().toISOString(),
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Sesión corrupta o inválida' },
      { status: 401 }
    );
  }
}
