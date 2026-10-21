import { prisma, isPrismaConfigured } from '@/lib/prisma';
import { sendPasswordResetEmail } from '@/lib/email';
import { SEED_USERS } from '@/lib/auth/users';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Por favor ingresa un correo electrónico válido.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 1000 * 60 * 60); // 1 hora de vigencia

    // Obtener la URL base (respetando encabezados o variable de entorno)
    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`;
    const resetUrl = `${baseUrl}/auth/reset-password?token=${token}`;

    let userFound = false;
    let userName = 'Usuario';

    if (isPrismaConfigured()) {
      // Buscar usuario en base de datos PostgreSQL
      const dbUser = await prisma.user.findFirst({
        where: { email: normalizedEmail },
        orderBy: { createdAt: 'desc' },
      });

      if (dbUser) {
        userFound = true;
        userName = dbUser.name;

        // Guardar token y expiración en la base de datos
        await prisma.user.update({
          where: { id: dbUser.id },
          data: {
            resetToken: token,
            resetTokenExpiry: expiry,
          },
        });
      }
    }

    // Si no está en BD pero coincide con un usuario semilla (SEED_USERS)
    if (!userFound) {
      const seedUser = SEED_USERS.find(
        (u) => u.email.toLowerCase() === normalizedEmail
      );
      if (seedUser) {
        userFound = true;
        userName = seedUser.name;

        // Si la BD está disponible, sembrar este usuario para que pueda restablecer contraseña
        if (isPrismaConfigured()) {
          try {
            await prisma.user.create({
              data: {
                id: seedUser.id,
                email: seedUser.email.toLowerCase(),
                password: seedUser.password || 'password123',
                name: seedUser.name,
                businessName: seedUser.businessName,
                businessCategory: seedUser.businessCategory,
                graduationLevel: seedUser.graduationLevel,
                creditLimit: seedUser.creditLimit,
                availableCredit: seedUser.availableCredit,
                role: seedUser.role,
                resetToken: token,
                resetTokenExpiry: expiry,
              },
            });
          } catch (seedErr) {
            console.warn('[auth:forgot-password] No se pudo crear seed en BD:', seedErr);
          }
        }
      }
    }

    if (userFound) {
      // Enviar correo transaccional con Resend
      await sendPasswordResetEmail({
        to: normalizedEmail,
        name: userName,
        resetUrl,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Si el correo está registrado, se enviaron las instrucciones a tu bandeja.',
      // En desarrollo exponemos resetUrl para facilitar pruebas sin esperar al inbox
      devResetUrl: process.env.NODE_ENV === 'development' ? resetUrl : undefined,
    });
  } catch (error) {
    console.error('Error en forgot-password:', error);
    return NextResponse.json(
      { error: 'Ocurrió un error procesando la solicitud. Intenta de nuevo.' },
      { status: 500 }
    );
  }
}
