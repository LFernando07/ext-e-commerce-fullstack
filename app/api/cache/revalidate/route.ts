import { revalidatePath, revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { action, target } = await request.json();

    if (action === 'revalidateTag' && target) {
      // Invalida específicamente la capa de DATA CACHE asociada a este tag
      revalidateTag(target, { expire: 0 });
      return NextResponse.json({
        success: true,
        message: `Data Cache invalidado para el tag: "${target}"`,
        layer: 'Data Cache',
        timestamp: new Date().toISOString(),
      });
    }

    if (action === 'revalidatePath' && target) {
      // Invalida la capa de FULL ROUTE CACHE (HTML y RSC payload precompilado) para esta ruta
      revalidatePath(target);
      return NextResponse.json({
        success: true,
        message: `Full Route Cache purgado y revalidado para la ruta: "${target}"`,
        layer: 'Full Route Cache',
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json(
      { success: false, error: 'Acción no reconocida. Usa revalidateTag o revalidatePath.' },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Error al revalidar caché' },
      { status: 500 }
    );
  }
}
