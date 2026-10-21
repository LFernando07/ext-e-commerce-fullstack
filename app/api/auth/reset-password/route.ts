import { prisma, isPrismaConfigured } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Token de recuperación no proporcionado o inválido.' },
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: 'La nueva contraseña debe tener al menos 6 caracteres.' },
        { status: 400 }
      );
    }

    if (!isPrismaConfigured()) {
      return NextResponse.json(
        { error: 'Base de datos no disponible.' },
        { status: 503 }
      );
    }

    // Buscar usuario con el token correspondiente y verificar que no haya expirado
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'El enlace de recuperación es inválido o ha expirado. Por favor solicita uno nuevo.' },
        { status: 400 }
      );
    }

    // Actualizar contraseña y limpiar el token para que no pueda reutilizarse
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: password,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Tu contraseña ha sido actualizada con éxito. Ya puedes iniciar sesión.',
    });
  } catch (error) {
    console.error('Error al restablecer contraseña:', error);
    return NextResponse.json(
      { error: 'Ocurrió un error al actualizar la contraseña.' },
      { status: 500 }
    );
  }
}
