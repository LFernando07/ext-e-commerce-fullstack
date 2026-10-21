import { prisma, isPrismaConfigured } from '@/lib/prisma';
import { sendWelcomeEmail } from '@/lib/email';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { name, email, password, businessName, businessCategory } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Nombre, correo y contraseña son obligatorios.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const isDev = process.env.NODE_ENV === 'development';

    // Validación de unicidad de correo:
    // En DESARROLLO se permite reutilizar el correo para pruebas con la cuenta gratuita de Resend.
    // En PRODUCCIÓN se exige estrictamente que sea único.
    if (!isDev && isPrismaConfigured()) {
      const existing = await prisma.user.findFirst({
        where: { email: normalizedEmail },
      });

      if (existing) {
        return NextResponse.json(
          { error: 'Este correo electrónico ya está registrado. Inicia sesión o recupera tu contraseña.' },
          { status: 400 }
        );
      }
    }

    let createdUser;

    if (isPrismaConfigured()) {
      createdUser = await prisma.user.create({
        data: {
          name: name.trim(),
          email: normalizedEmail,
          password: password,
          businessName: businessName?.trim() || 'Capsule Corp Explorer',
          businessCategory: businessCategory?.trim() || 'Coleccionables & Cápsulas',
          graduationLevel: 'Starter',
          creditLimit: 5000,
          availableCredit: 5000,
          role: 'neni',
        },
      });
    } else {
      // Mock para entornos sin base de datos conectada
      createdUser = {
        id: `usr_${Date.now()}`,
        name: name.trim(),
        email: normalizedEmail,
        businessName: businessName?.trim() || 'Capsule Corp Explorer',
        businessCategory: businessCategory?.trim() || 'Coleccionables & Cápsulas',
        graduationLevel: 'Starter',
        creditLimit: 5000,
        availableCredit: 5000,
        role: 'neni',
        createdAt: new Date(),
      };
    }

    const safeUser = {
      id: createdUser.id,
      name: createdUser.name,
      email: createdUser.email,
      role: (createdUser.role as 'neni' | 'admin') || 'neni',
      businessName: createdUser.businessName,
      businessCategory: createdUser.businessCategory,
      graduationLevel: (createdUser.graduationLevel as 'Starter' | 'Growth' | 'Trusted') || 'Starter',
      creditLimit: createdUser.creditLimit,
      availableCredit: createdUser.availableCredit,
      joinedDate: (createdUser.createdAt ? new Date(createdUser.createdAt) : new Date())
        .toISOString()
        .split('T')[0],
    };

    // Envío del correo de bienvenida mediante Resend (asíncrono sin bloquear la respuesta)
    sendWelcomeEmail({
      to: safeUser.email,
      name: safeUser.name,
    }).catch((emailErr) => {
      console.warn('[auth:register] Error enviando correo de bienvenida Resend:', emailErr);
    });

    const response = NextResponse.json({
      success: true,
      message: 'Cuenta creada exitosamente.',
      user: safeUser,
    });

    // Sesión automática inmediata
    response.cookies.set('nenis_session', JSON.stringify(safeUser), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 días
    });

    return response;
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error en registro:', err);
    return NextResponse.json(
      { error: 'Error al registrar la cuenta. Por favor verifica los datos.' },
      { status: 500 }
    );
  }
}
