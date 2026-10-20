'use client';

/**
 * @file components/dbz/StorefrontGrid.tsx
 * @description Catálogo interactivo de cápsulas de guerreros con filtros en cliente.
 * 
 * @concept Client Side Filtering, Responsive Grid, Progressive Hydration
 */

import { useState, useMemo } from 'react';
import ProductCard from './ProductCard';
import { ECommerceProduct } from '@/types/dragonball';

interface StorefrontGridProps {
  initialProducts: ECommerceProduct[];
}

export default function StorefrontGrid({ initialProducts }: StorefrontGridProps) {
  const [selectedRace, setSelectedRace] = useState<string>('all');
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Extracción de razas únicas presentes en el catálogo
  const availableRaces = useMemo(() => {
    const races = new Set<string>();
    initialProducts.forEach((p) => {
      if (p.race) races.add(p.race);
    });
    return Array.from(races);
  }, [initialProducts]);

  // Filtrado reactivo en cliente para respuesta instantánea
  const filteredProducts = useMemo(() => {
    return initialProducts.filter((product) => {
      const matchRace =
        selectedRace === 'all' ||
        product.race?.toLowerCase() === selectedRace.toLowerCase();

      const matchTier =
        selectedTier === 'all' || product.capsuleType === selectedTier;

      const matchQuery =
        !searchQuery ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.affiliation?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchRace && matchTier && matchQuery;
    });
  }, [initialProducts, selectedRace, selectedTier, searchQuery]);

  return (
    <section className="space-y-8" id="catalogo">
      {/* Barra de Filtros y Búsqueda */}
      <div className="p-6 rounded-2xl bg-[#131722] border border-white/10 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          
          {/* Búsqueda por texto */}
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
              🔍
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar guerrero por nombre o afiliación (ej. Goku, Z Fighter)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0b0e14] border border-white/10 text-white text-xs sm:text-sm focus:outline-none focus:border-cyan-500 transition-colors placeholder:text-gray-500"
            />
          </div>

          {/* Filtro por Tipo de Cápsula */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-gray-400 uppercase hidden sm:inline">
              Cápsula:
            </span>
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-[#0b0e14] border border-white/10 text-white text-xs sm:text-sm focus:outline-none focus:border-cyan-500"
            >
              <option value="all">Todas las Cápsulas</option>
              <option value="Hoi-Poi Legendaria">Hoi-Poi Legendaria</option>
              <option value="Hoi-Poi Premium">Hoi-Poi Premium</option>
              <option value="Hoi-Poi Básica">Hoi-Poi Básica</option>
            </select>
          </div>
        </div>

        {/* Píldoras de Razas */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs">
          <span className="text-gray-400 font-mono uppercase text-[11px] mr-1 flex-shrink-0">
            Raza:
          </span>
          <button
            type="button"
            onClick={() => setSelectedRace('all')}
            className={`px-3 py-1.5 rounded-full font-mono transition-colors flex-shrink-0 ${
              selectedRace === 'all'
                ? 'bg-cyan-500 text-gray-950 font-bold'
                : 'bg-white/5 text-gray-300 hover:bg-white/10'
            }`}
          >
            Todas ({initialProducts.length})
          </button>
          {availableRaces.map((race) => (
            <button
              key={race}
              type="button"
              onClick={() => setSelectedRace(race)}
              className={`px-3 py-1.5 rounded-full font-mono transition-colors flex-shrink-0 ${
                selectedRace === race
                  ? 'bg-cyan-500 text-gray-950 font-bold'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10'
              }`}
            >
              {race}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Productos */}
      {filteredProducts.length === 0 ? (
        <div className="p-16 rounded-2xl bg-[#131722] border border-white/10 text-center space-y-3">
          <span className="text-4xl">📡</span>
          <h3 className="font-display font-bold text-lg text-white">
            No se encontraron cápsulas con estos criterios
          </h3>
          <p className="text-xs text-gray-400">
            Intenta limpiando la búsqueda o seleccionando otra raza de guerrero.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedRace('all');
              setSelectedTier('all');
              setSearchQuery('');
            }}
            className="mt-2 px-4 py-2 rounded-xl bg-cyan-500 text-gray-950 text-xs font-bold hover:bg-cyan-400 transition-colors"
          >
            Restablecer Filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product, idx) => (
            <ProductCard
              key={product.id}
              product={product}
              priority={idx < 4} // Las primeras 4 imágenes cargan con alta prioridad para mejorar LCP
            />
          ))}
        </div>
      )}
    </section>
  );
}
