import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';

export async function GET() {
  try {
    // Provocar un error intencional de prueba para validar la conexión con Sentry
    throw new Error('🎉 ¡Prueba de conexión exitosa! Capsule Corp conectado a Sentry en desarrollo.');
  } catch (error) {
    const eventId = Sentry.captureException(error);
    // Esperar a que el paquete HTTP viaje a Sentry antes de cerrar la conexión
    const flushed = await Sentry.flush(3000);

    return NextResponse.json({
      success: true,
      message: 'Evento enviado y sincronizado con Sentry.',
      eventId,
      flushed,
      organization: 'zenithenterprice',
      project: 'ext-e-commerce-fullstack-public',
      timestamp: new Date().toISOString(),
    });
  }
}
