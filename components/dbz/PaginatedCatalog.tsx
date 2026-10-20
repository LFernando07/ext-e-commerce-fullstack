/**
 * @file components/dbz/PaginatedCatalog.tsx
 * @description Componente de servidor que resuelve searchParams dentro del límite de Suspense para PPR.
 * 
 * @concept Partial Prerendering (PPR), searchParams inside Suspense, Granular Data Cache
 * 
 * 🎓 PATRÓN ARQUITECTÓNICO DE NEXT.JS 16 PPR + searchParams:
 * ─────────────────────────────────────────────────────────────────────────────
 * Cuando Partial Prerendering (PPR) está activado (`partialPrefetching: true`), leer `searchParams`
 * directamente en la raíz de `page.tsx` rompería el cascarón estático pre-renderizado (Static Shell).
 * 
 * La solución recomendada por Next.js es:
 * 1. La página principal (`app/page.tsx`) sirve el Cascarón Estático (0ms CDN).
 * 2. `PaginatedCatalog` se envuelve en `<Suspense fallback={<CatalogSkeleton />}>`.
 * 3. Dentro de este componente se resuelve `await searchParams` y se hace el fetch con tags por página.
 * 4. Al cambiar de página (`/?page=2`), solo este hueco dinámico se actualiza sin recargar el cascarón.
 */

import { getDBZCharacters } from '@/lib/dragonball';
import StorefrontGrid from './StorefrontGrid';
import Pagination from './Pagination';
import { SearchParamsProps } from '@/types/general';



export default async function PaginatedCatalog({ searchParams }: SearchParamsProps) {
  // Resolvemos searchParams dentro del componente de servidor para habilitar PPR
  const resolvedSearchParams = await searchParams;
  const currentPage = Math.max(1, parseInt(resolvedSearchParams.page || '1', 10));
  const limit = Math.max(4, parseInt(resolvedSearchParams.limit || '12', 10));


  // Fetch de productos de Dragon Ball API con tags granulares por página
  // Es cache
  const { products, meta } = await getDBZCharacters({
    limit,
    page: currentPage,
    race: resolvedSearchParams.race,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider block mb-1">
            Inventario Disponible
          </span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-white">
            Catálogo Oficial de Cápsulas Hoi-Poi
          </h2>
        </div>
        <span className="text-xs font-mono text-gray-400 bg-white/5 px-3 py-1.5 rounded-full border border-white/10 self-start sm:self-center">
          Página {currentPage} de {meta.totalPages} ({meta.totalItems} guerreros en total)
        </span>
      </div>

      <p className="text-xs sm:text-sm text-gray-400 max-w-2xl font-body">
        Haz clic en cualquier guerrero para inspeccionar su ficha técnica detallada (con transformaciones y planeta de origen)
        o añádelo directamente a tu cápsula de compras.
      </p>

      {/* Grid de productos de la página actual */}
      <StorefrontGrid initialProducts={products} />

      {/* Control de Paginación basado en searchParams de Next.js */}
      <Pagination
        currentPage={currentPage}
        totalPages={meta.totalPages}
        totalItems={meta.totalItems}
        itemsPerPage={limit}
        searchParams={resolvedSearchParams}
      />
    </div>
  );
}

/**
 * Esqueleto de carga para el catálogo durante el cambio de página o primera carga
 */
export function CatalogSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-64 bg-white/10 rounded-xl" />
      <div className="h-4 w-96 bg-white/5 rounded-md" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-96 rounded-2xl bg-[#131722] border border-white/5 p-4 flex flex-col justify-between"
          >
            <div className="w-full h-56 bg-white/5 rounded-xl" />
            <div className="space-y-2">
              <div className="h-4 w-3/4 bg-white/10 rounded" />
              <div className="h-3 w-1/2 bg-white/5 rounded" />
            </div>
            <div className="h-10 bg-white/5 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}
