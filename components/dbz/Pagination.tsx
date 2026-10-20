/**
 * @file components/dbz/Pagination.tsx
 * @description Componente de paginación del lado del servidor basado en searchParams de Next.js App Router.
 * 
 * @concept Next.js URL SearchParams Pagination, Link Prefetching, Progressive Enhancement, SEO Friendly
 * 
 * 🎓 ¿POR QUÉ LA PAGINACIÓN POR URL (searchParams) ES UN CONCEPTO CLAVE EN NEXT.JS?
 * ─────────────────────────────────────────────────────────────────────────────
 * 1. URL como Single Source of Truth (Fuente única de la verdad):
 *    - El estado de la página actual no vive oculto en un `useState()` volátil del navegador,
 *      sino explícito en la URL: `/?page=2&limit=12#catalogo`.
 * 
 * 2. Marcadores y Enlaces Compartibles (Shareability):
 *    - Si un usuario le envía el enlace `/?page=3` a un compañero, este abrirá exactamente
 *      la página 3 sin desincronizaciones.
 * 
 * 3. SEO y Rastreo de Motores de Búsqueda (Googlebot):
 *    - Los buscadores pueden rastrear e indexar cada página de productos mediante los enlaces
 *      estándar `<Link href="...">`, a diferencia de botones con `onClick` que ejecutan estado en memoria.
 * 
 * 4. Progressive Enhancement (Mejora progresiva):
 *    - Si el usuario tiene una red lenta o JavaScript aún no se ha descargado por completo,
 *      los enlaces HTML estándar permiten navegar entre páginas sin interrupción.
 * 
 * 5. Caché Granular en el Servidor:
 *    - Cada página (`page=1`, `page=2`, etc.) es almacenada y servida con Data Cache de forma independiente.
 */

import Link from 'next/link';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  basePath?: string;
  searchParams?: Record<string, string | undefined>;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  basePath = '/',
  searchParams = {},
}: PaginationProps) {
  if (totalPages <= 1) return null;

  // Función helper para construir URLs conservando otros searchParams (filtros, etc.)
  const createPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, val]) => {
      if (val && key !== 'page') {
        params.set(key, val);
      }
    });
    params.set('page', pageNumber.toString());
    return `${basePath}?${params.toString()}#catalogo`;
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generación inteligente de rango de páginas visibles
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('ellipsis');

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) pages.push('ellipsis');
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <nav
      aria-label="Paginación de Guerreros Z"
      className="p-4 sm:p-6 rounded-2xl bg-[#131722] border border-white/10 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 mt-8"
    >
      {/* Resumen de Resultados */}
      <div className="text-xs font-mono text-gray-400">
        Mostrando cápsulas <strong className="text-cyan-400 font-bold">{startItem}</strong> -{' '}
        <strong className="text-cyan-400 font-bold">{endItem}</strong> de{' '}
        <strong className="text-white font-bold">{totalItems}</strong> guerreros Z
      </div>

      {/* Controles de Navegación de Páginas */}
      <div className="flex items-center gap-1.5 font-mono text-xs">
        
        {/* Botón Anterior */}
        {currentPage > 1 ? (
          <Link
            href={createPageUrl(currentPage - 1)}
            scroll={false}
            className="px-3 py-2 rounded-xl bg-white/5 hover:bg-cyan-500/10 text-gray-300 hover:text-cyan-300 border border-white/10 hover:border-cyan-500/30 transition-all flex items-center gap-1 font-semibold"
            aria-label="Ir a página anterior"
          >
            <span>←</span>
            <span className="hidden sm:inline">Anterior</span>
          </Link>
        ) : (
          <span className="px-3 py-2 rounded-xl bg-white/5 text-gray-600 border border-white/5 cursor-not-allowed flex items-center gap-1">
            <span>←</span>
            <span className="hidden sm:inline">Anterior</span>
          </span>
        )}

        {/* Píldoras de Números de Página */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((p, idx) => {
            if (p === 'ellipsis') {
              return (
                <span key={`ellipsis-${idx}`} className="px-2 text-gray-500">
                  ...
                </span>
              );
            }

            const isCurrent = p === currentPage;
            return (
              <Link
                key={`page-${p}`}
                href={createPageUrl(p)}
                scroll={false}
                aria-current={isCurrent ? 'page' : undefined}
                className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold transition-all ${
                  isCurrent
                    ? 'bg-cyan-500 text-gray-950 shadow-md shadow-cyan-500/25 scale-105'
                    : 'bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10'
                }`}
              >
                {p}
              </Link>
            );
          })}
        </div>

        {/* Botón Siguiente */}
        {currentPage < totalPages ? (
          <Link
            href={createPageUrl(currentPage + 1)}
            scroll={false}
            className="px-3 py-2 rounded-xl bg-white/5 hover:bg-cyan-500/10 text-gray-300 hover:text-cyan-300 border border-white/10 hover:border-cyan-500/30 transition-all flex items-center gap-1 font-semibold"
            aria-label="Ir a página siguiente"
          >
            <span className="hidden sm:inline">Siguiente</span>
            <span>→</span>
          </Link>
        ) : (
          <span className="px-3 py-2 rounded-xl bg-white/5 text-gray-600 border border-white/5 cursor-not-allowed flex items-center gap-1">
            <span className="hidden sm:inline">Siguiente</span>
            <span>→</span>
          </span>
        )}

      </div>
    </nav>
  );
}
