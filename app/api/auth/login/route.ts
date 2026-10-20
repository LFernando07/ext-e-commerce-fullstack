import { validateUserCredentials } from '@/lib/auth/users';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Por favor ingresa tu correo y contraseña.' },
        { status: 400 }
      );
    }

    const user = validateUserCredentials(email, password);

    if (!user) {
      return NextResponse.json(
        { error: 'Credenciales inválidas. Revisa tu correo y contraseña.' },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: 'Inicio de sesión exitoso',
      user,
    });

    // Guardar sesión en cookie segura
    response.cookies.set('nenis_session', JSON.stringify(user), {
      httpOnly: false, // Accesible para client-side y middleware sin complicaciones
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 días
    });

    return response;
  } catch (error) {
    console.error('Error en login:', error);
    return NextResponse.json(
      { error: 'Ocurrió un error al iniciar sesión. Intenta nuevamente.' },
      { status: 500 }
    );
  }
}
