import { NextResponse } from 'next/server';

// Simula un servicio externo (como tasas financieras o catálogo de insumos)
export async function GET() {
  const generatedAt = new Date().toISOString();
  const randomFactor = Math.floor(Math.random() * 900) + 100;

  return NextResponse.json({
    fuente: 'Servicio Externo de Finanzas Nenis',
    tasasInteres: {
      starter: '0% comisiones',
      growth: 'Plazos preferenciales',
      trusted: 'Línea revolvente VIP',
    },
    codigoActualizacion: `SYNC-${randomFactor}`,
    generadoEnServidor: generatedAt,
  });
}
