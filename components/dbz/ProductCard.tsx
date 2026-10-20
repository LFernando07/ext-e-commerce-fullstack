'use client';

/**
 * @file components/dbz/ProductCard.tsx
 * @description Tarjeta de producto de Capsule Corp para exhibir un guerrero Z.
 * 
 * @concept next/image optimization, Client Component Interactivity, Dynamic Links
 * 
 * Conceptos clave de Next.js demostrados en este componente:
 * 1. `next/image`:
 *    - Carga automática en formato moderno (.webp / .avif).
 *    - Prevención de Cumulative Layout Shift (CLS) usando `sizes` y contenedor aspect-ratio.
 *    - Lazy loading nativo automático (excepto si se pasa `priority={true}`).
 *    - Dominio permitido configurado en `next.config.ts` (`images.remotePatterns`).
 * 2. `next/link`:
 *    - Navegación del lado del cliente (SPA feel) hacia la ruta dinámica `/personajes/[id]`.
 *    - Prefetching automático de la ruta dinámica en viewport.
 */

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ECommerceProduct } from '@/types/dragonball';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
  product: ECommerceProduct;
  priority?: boolean;
}

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const { addToCart } = useCart();
  const [isAddedFeedback, setIsAddedFeedback] = useState(false);

  const handleAdd = () => {
    addToCart(product, 1);
    setIsAddedFeedback(true);
    setTimeout(() => setIsAddedFeedback(false), 1200);
  };

  // Color de badge según tipo de Cápsula
  const getBadgeStyle = (tier: ECommerceProduct['powerTier']) => {
    switch (tier) {
      case 'Nivel Z (Supremo)':
        return 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-amber-500/20';
      case 'Nivel S (Guerrero)':
        return 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-blue-500/20';
      case 'Nivel A (Avanzado)':
        return 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-emerald-500/20';
      default:
        return 'bg-gray-700 text-gray-200';
    }
  };

  return (
    <article className="group relative bg-[#131722] rounded-2xl border border-white/10 overflow-hidden shadow-xl hover:shadow-2xl hover:border-cyan-500/50 transition-all duration-300 flex flex-col justify-between">
      {/* Glow ambiental al hacer hover */}
      <div className="absolute inset-0 bg-linear-to from-cyan-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      <div>
        {/* Cabecera de la tarjeta: Badge de Cápsula y Ki */}
        <div className="p-4 pb-0 flex items-center justify-between gap-2 z-10 relative">
          <span
            className={`text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full font-bold shadow-sm ${getBadgeStyle(
              product.powerTier
            )}`}
          >
            {product.capsuleType}
          </span>
          <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
            Ki: {product.ki || 'Desc.'}
          </span>
        </div>

        {/* Contenedor de Imagen Optimizado con next/image */}
        <Link
          href={`/personajes/${product.id}`}
          className="relative w-full h-64 p-4 my-2 overflow-hidden flex items-center justify-center cursor-pointer group-hover:scale-105 transition-transform duration-300"
        >
          <div className="relative w-full h-full">
            <Image
              src={product.image}
              alt={`Cápsula Hoi-Poi: ${product.name}`}
              fill
              // CLS identificado y mitigado con `sizes` y contenedor de aspecto fijo
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              priority={priority}
              className="object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)] group-hover:drop-shadow-[0_15px_30px_rgba(6,182,212,0.4)] transition-all duration-300"
            />
          </div>
        </Link>

        {/* Información del Guerrero */}
        <div className="px-5 pb-3">
          <div className="flex items-center gap-2 text-xs text-gray-400 font-mono mb-1">
            <span>Raza: {product.race}</span>
            <span>•</span>
            <span>Stock: {product.stock} un.</span>
          </div>

          <Link href={`/personajes/${product.id}`}>
            <h3 className="font-display font-bold text-xl text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>

          <p className="text-xs text-gray-400 line-clamp-2 mt-1 min-h-[32px] leading-relaxed">
            {product.description || 'Espécimen guerrero preparado por la división científica de Capsule Corp.'}
          </p>
        </div>
      </div>

      {/* Footer de la tarjeta: Precio y Acciones */}
      <div className="p-5 pt-3 border-t border-white/5 bg-[#0e111a]/80 flex flex-col items-center justify-between gap-3">
        <div className='flex flex-row justify-center items-center gap-2'>
          <span className="text-[10px] text-gray-400 font-mono uppercase tracking-wider block">
            Precio Cápsula
          </span>
          <span className="font-mono font-bold text-lg text-amber-400 tracking-tight">
            {product.formattedPrice}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Enlace al detalle dinámico */}
          <Link
            href={`/personajes/${product.id}`}
            className="px-8 py-2 rounded-xl bg-white/5 font-bold hover:bg-white/10 text-gray-300 hover:text-white text-xs transition-colors border border-white/10"
            title="Ver ficha técnica"
          >
            Detalles
          </Link>

          {/* Botón de añadir al carrito con feedback visual */}
          {/* Component interactivity: Añadir al carrito con feedback visual de éxito (✓) y animación de escala al hacer clic. */}
          <button
            type="button"
            onClick={handleAdd}
            className={`px-8 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 shadow-md active:scale-95 ${
              isAddedFeedback
                ? 'bg-emerald-500 text-white shadow-emerald-500/30'
                : 'bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold shadow-cyan-500/25'
            }`}
          >
            {isAddedFeedback ? (
              <>
                <span>✓</span>
                <span>¡Cápsula Lista!</span>
              </>
            ) : (
              <>
                <span>💊</span>
                <span>Añadir</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
