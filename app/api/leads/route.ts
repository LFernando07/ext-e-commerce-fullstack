import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Lead recibido en el servidor:', body);

    // Aquí podrás guardar en tu base de datos o enviar a un CRM/email
    return NextResponse.json({ success: true, message: 'Guardado correctamente' }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Error al procesar lead' }, { status: 500 });
  }
}
