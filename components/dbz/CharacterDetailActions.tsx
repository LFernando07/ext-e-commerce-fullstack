'use client';

/**
 * @file components/dbz/CharacterDetailActions.tsx
 * @description Botones y selector de cantidad para adquirir una cápsula Hoi-Poi en el detalle.
 * 
 * @concept Client Component Interactivity, React Context Consumer, Optimistic Feedback
 */

import { useState } from 'react';
import { ECommerceProduct } from '@/types/dragonball';
import { useCart } from '@/context/CartContext';

interface CharacterDetailActionsProps {
  product: ECommerceProduct;
}

export default function CharacterDetailActions({ product }: CharacterDetailActionsProps) {
  const { addToCart, openCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    openCart();
  };

  return (
    <div className="p-6 rounded-3xl bg-[#131722] border border-cyan-500/30 shadow-2xl space-y-6">
      
      {/* Selector de Unidades & Total Zeni */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-mono uppercase text-gray-400 block">
            Cantidad de Cápsulas:
          </span>
          <div className="flex items-center gap-3 mt-2">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-base flex items-center justify-center border border-white/10 transition-colors"
            >
              -
            </button>
            <span className="font-mono font-bold text-lg text-cyan-300 w-8 text-center">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
              className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-base flex items-center justify-center border border-white/10 transition-colors"
            >
              +
            </button>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs font-mono uppercase text-gray-400 block">
            Subtotal:
          </span>
          <span className="font-mono font-bold text-2xl text-amber-400">
            {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(product.priceInZeni * quantity)}
          </span>
        </div>
      </div>

      {/* Botones de Acción */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={handleAddToCart}
          className={`py-3.5 px-6 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg active:scale-98 ${
            justAdded
              ? 'bg-emerald-500 text-white shadow-emerald-500/25'
              : 'bg-white/10 hover:bg-white/15 text-white border border-white/20'
          }`}
        >
          {justAdded ? (
            <>
              <span>✓</span>
              <span>¡Cápsula Añadida!</span>
            </>
          ) : (
            <>
              <span>💊</span>
              <span>Añadir al Carrito</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleBuyNow}
          className="py-3.5 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-gray-950 font-bold text-sm shadow-xl shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 active:scale-98"
        >
          <span>⚡</span>
          <span>Comprar de Inmediato</span>
        </button>
      </div>

      {/* Garantía Capsule Corp */}
      <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-gray-400 font-mono">
        <span className="flex items-center gap-1.5">
          <span className="text-cyan-400">🛡️</span> Autenticidad Saiyajin Verificada
        </span>
        <span>Entrega Instantánea</span>
      </div>

    </div>
  );
}
