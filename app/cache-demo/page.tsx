import React from 'react';
import Link from 'next/link';
import CacheControls from '@/components/CacheControls';
import { cacheTag } from 'next/cache';

// 1. DATA CACHE: Función aislada con directiva 'use cache' y cacheTag('tasas-nenis')
// Esta capa persiste solo los datos del catálogo financiero independientemente de la página.
async function getCachedFinancialData() {
  'use cache';
  cacheTag('tasas-nenis');

  return {
    fuente: 'Servicio Centralizado de Tasas y Plazos Nenis',
    tasasInteres: {
      starter: '0% comisiones iniciales',
      growth: 'Plazos flexibles hasta 6 quincenas',
      trusted: 'Línea revolvente VIP',
    },
    codigoActualizacion: `SYNC-${Math.floor(Math.random() * 900) + 100}`,
    generadoEnServidor: new Date().toISOString(),
  };
}

// 2. FULL ROUTE CACHE: Snapshot estático pre-renderizado del HTML de toda la ruta
async function getFullRouteSnapshot() {
  'use cache';
  return {
    renderizadoEn: new Date().toISOString(),
  };
}

export default async function CacheDemoPage() {
  // Snapshot de Full Route Cache
  const routeSnapshot = await getFullRouteSnapshot();

  // Consulta de Data Cache
  const dataCacheResult = await getCachedFinancialData();

  return (
    <div className="min-h-screen bg-[#FAF9FF] py-10 px-2 sm:px-6 lg:px-4 font-body">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Cabecera */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E2DFF5] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5B3289]/10 text-[#5B3289] text-xs font-ui font-semibold mb-2">
              <span>⚡</span> Laboratorio de Caché de Next.js 16
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-[#1A1228]">
              Data Cache vs Full Route Cache
            </h1>
            <p className="text-sm text-[#5E5C78] mt-1">
              Compara en vivo cómo Next.js maneja la persistencia de datos (Data Cache) frente al HTML de la ruta completa (Full Route Cache).
            </p>
          </div>

          <Link
            href="/"
            className="self-start md:self-center px-10 py-2 rounded-full border border-[#E2DFF5] text-[#5E5C78] hover:text-[#1A1228] text-xs font-ui font-medium transition-colors"
          >
            ← Volver al inicio
          </Link>
        </div>

        {/* Demostración en Vivo: Tarjetas Comparativas con Timestamps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Tarjeta 1: DATA CACHE */}
          <div className="p-6 sm:p-7 rounded-3xl bg-white border-2 border-[#5B3289]/30 shadow-sm flex flex-col justify-between space-y-5">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-3 py-1 rounded-full bg-[#5B3289]/15 text-[#5B3289] text-xs font-ui font-bold">
                  Data Cache
                </span>
                <span className="text-[11px] font-mono text-[#5E5C78]">
                  {`tag: 'tasas-nenis'`}
                </span>
              </div>

              <h2 className="font-display font-bold text-xl text-[#1A1228] mb-2">
                Caché a Nivel de Datos
              </h2>

              <p className="text-xs text-[#5E5C78] leading-relaxed mb-4">
                Guarda los resultados de funciones y peticiones de datos. Puede compartirse y reutilizarse entre múltiples pantallas sin duplicar consultas.
              </p>

              <div className="space-y-2 p-4 rounded-2xl bg-[#FAF9FF] border border-[#E2DFF5] text-xs font-ui">
                <div className="flex justify-between">
                  <span className="text-[#5E5C78]">Fuente:</span>
                  <strong className="text-[#1A1228]">{dataCacheResult.fuente}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5E5C78]">Código de sincronización:</span>
                  <strong className="font-mono text-[#5B3289]">{dataCacheResult.codigoActualizacion}</strong>
                </div>
                <div className="flex justify-between border-t border-[#E2DFF5] pt-2">
                  <span className="text-[#5E5C78]">Generado en Data Cache:</span>
                  <span className="font-mono text-[#1A1228] text-[11px]">
                    {new Date(dataCacheResult.generadoEnServidor).toLocaleTimeString('es-MX')}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-[11px] font-ui text-[#5E5C78] bg-[#FAF9FF] p-3 rounded-xl border border-[#E2DFF5]">
              💡 <strong>Regla:</strong> Si recargas la página, este dato no cambia porque se lee desde el Data Cache persistente.
            </div>
          </div>

          {/* Tarjeta 2: FULL ROUTE CACHE */}
          <div className="p-6 sm:p-7 rounded-3xl bg-white border-2 border-[#DD4591]/30 shadow-sm flex flex-col justify-between space-y-5">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-3 py-1 rounded-full bg-[#DD4591]/15 text-[#DD4591] text-xs font-ui font-bold">
                  Full Route Cache
                </span>
                <span className="text-[11px] font-mono text-[#5E5C78]">
                  {`ruta: '/cache-demo'`}
                </span>
              </div>

              <h2 className="font-display font-bold text-xl text-[#1A1228] mb-2">
                Caché a Nivel de Ruta Completa (HTML)
              </h2>

              <p className="text-xs text-[#5E5C78] leading-relaxed mb-4">
                Guarda el <strong>HTML estático y el Payload de React Server Components</strong> de toda la página. El servidor entrega la vista completa instantáneamente.
              </p>

              <div className="space-y-2 p-4 rounded-2xl bg-[#FAF9FF] border border-[#E2DFF5] text-xs font-ui">
                <div className="flex justify-between">
                  <span className="text-[#5E5C78]">Estado de la ruta:</span>
                  <strong className="text-emerald-700">Pre-renderizada (Cache Components)</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5E5C78]">Estrategia:</span>
                  <strong className="text-[#1A1228]">Static Route Payload</strong>
                </div>
                <div className="flex justify-between border-t border-[#E2DFF5] pt-2">
                  <span className="text-[#5E5C78]">HTML generado en servidor:</span>
                  <span className="font-mono text-[#DD4591] text-[11px]">
                    {new Date(routeSnapshot.renderizadoEn).toLocaleTimeString('es-MX')}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-[11px] font-ui text-[#5E5C78] bg-[#FAF9FF] p-3 rounded-xl border border-[#E2DFF5]">
              💡 <strong>Regla:</strong> Si recargas la página, este HTML estático se sirve en 0 ms sin re-renderizar nada.
            </div>
          </div>

        </div>

        {/* Panel Interactivo de Revalidación en Vivo */}
        <CacheControls />

        {/* Tabla Comparativa Conceptual */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E2DFF5] shadow-sm space-y-4">
          <h3 className="font-display font-bold text-xl text-[#1A1228]">
            Resumen de Diferencias: Data Cache vs Full Route Cache
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-ui border-collapse">
              <thead>
                <tr className="border-b border-[#E2DFF5] text-[#5E5C78]">
                  <th className="py-3 px-4 font-semibold">Criterio</th>
                  <th className="py-3 px-4 font-semibold text-[#5B3289]">Data Cache</th>
                  <th className="py-3 px-4 font-semibold text-[#DD4591]">Full Route Cache</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2DFF5] text-[#1A1228] font-body text-xs">
                <tr>
                  <td className="py-3 px-4 font-ui font-medium text-[#5E5C78]">¿Qué almacena?</td>
                  <td className="py-3 px-4">Respuestas de peticiones <code className="bg-[#FAF9FF] px-1 py-0.5 rounded text-[#5B3289]">fetch()</code> y funciones con <code className="bg-[#FAF9FF] px-1 py-0.5 rounded text-[#5B3289]">{'use cache'}</code>.</td>
                  <td className="py-3 px-4">HTML completo y React Server Component (RSC) Payload ya renderizado.</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-ui font-medium text-[#5E5C78]">Alcance (Scope)</td>
                  <td className="py-3 px-4"><strong>Por petición/función:</strong> Reutilizable entre diferentes páginas y componentes.</td>
                  <td className="py-3 px-4"><strong>Por ruta:</strong> Afecta a una URL completa específica.</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-ui font-medium text-[#5E5C78]">¿Dónde vive?</td>
                  <td className="py-3 px-4">Servidor de Next.js (Filesystem o almacén de caché distribuido).</td>
                  <td className="py-3 px-4">Servidor de Next.js / CDN de Borde (Edge Cache).</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-ui font-medium text-[#5E5C78]">¿Cómo se invalida bajo demanda?</td>
                  <td className="py-3 px-4"><code className="font-mono text-[#5B3289]">{`revalidateTag('nombre-tag')`}</code></td>
                  <td className="py-3 px-4"><code className="font-mono text-[#DD4591]">{`revalidatePath('/mi-ruta')`}</code></td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-ui font-medium text-[#5E5C78]">Relación con PPR (Partial Prerendering)</td>
                  <td className="py-3 px-4">Alimenta tanto las partes estáticas como los huecos dinámicos que streamean.</td>
                  <td className="py-3 px-4">Provee el <strong>cascarón estático (shell)</strong> instantáneo del que emana el PPR.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
