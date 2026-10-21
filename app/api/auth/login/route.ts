import { validateUserCredentials } from '@/lib/auth/users';
import { prisma, isPrismaConfigured } from '@/lib/prisma';
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

    const normalizedEmail = email.trim().toLowerCase();
    let user = null;

    // 1. Buscar primero en la base de datos Supabase (Prisma)
    if (isPrismaConfigured()) {
      try {
        const dbUser = await prisma.user.findFirst({
          where: {
            email: normalizedEmail,
            password: password,
          },
          orderBy: { createdAt: 'desc' }, // En dev si hay repetidos, toma el más reciente
        });

        if (dbUser) {
          user = {
            id: dbUser.id,
            email: dbUser.email,
            name: dbUser.name,
            role: (dbUser.role as 'neni' | 'admin') || 'neni',
            businessName: dbUser.businessName,
            businessCategory: dbUser.businessCategory,
            graduationLevel: (dbUser.graduationLevel as 'Starter' | 'Growth' | 'Trusted') || 'Starter',
            creditLimit: dbUser.creditLimit,
            availableCredit: dbUser.availableCredit,
            joinedDate: dbUser.createdAt.toISOString().split('T')[0],
          };
        }
      } catch (dbErr) {
        console.warn('[auth:login] Error consultando Supabase, recurriendo a seeds:', dbErr);
      }
    }

    // 2. Si no se encontró en la BD, verificar en usuarios semilla (SEED_USERS)
    if (!user) {
      user = validateUserCredentials(email, password);
    }

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
      httpOnly: false,
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
