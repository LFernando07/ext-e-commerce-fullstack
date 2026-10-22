'use client';

/**
 * @file components/Navbar.tsx
 * @description Barra de navegación global con soporte de autenticación, sesión y acceso al carrito de Capsule Corp.
 * 
 * @concept Client Component with Global Contexts (AuthContext, CartContext), Dynamic Navigation
 */

import { useState } from 'react';
import Link from 'next/link';
import LoginModal from '@/components/LoginModal';
import { paths } from '@/config/routes';

import { trackNavigationClick } from '@/lib/analytics';
import { useCart } from '@/app/hooks/useCart';
import { useAuth } from '@/app/hooks/useAuth';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { totalItems, openCart } = useCart();
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  // Colores por nivel de graduación según Brand Guidelines
  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'Starter':
        return 'bg-[#51BDC6]/15 text-[#00A4BF] border-[#51BDC6]/30';
      case 'Growth':
        return 'bg-[#F7A914]/20 text-[#1A1228] border-[#F7A914]/40 font-bold';
      case 'Trusted':
        return 'bg-[#5B3289]/70 text-[#f0f0f0] border-[#5B3289]/30';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[#0F131D]/90 backdrop-blur-md border-b border-cyan-500/20 text-white">
        <div className="max-w-full mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          
          {/* Logotipo Capsule Corp & Nenis Club */}
          <Link
            href={paths.landing.home}
            onClick={() => trackNavigationClick('Logo Home', '/')}
            className="flex items-center gap-2 group"
          >
            <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 font-bold text-sm group-hover:scale-110 transition-transform">
              CC
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-lg tracking-tight text-white leading-none">
                Capsule Corp <span className="text-cyan-400">Store</span>
              </span>
              <span className="text-[10px] text-gray-400 font-mono">
                Dragon Ball Z E-Commerce
              </span>
            </div>
          </Link>

          {/* Navegación Principal */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href={paths.landing.home}
              onClick={() => trackNavigationClick('Tienda & Inicio', '/')}
              className="text-sm font-ui text-gray-300 hover:text-cyan-400 font-medium transition-colors"
            >
              Tienda & Inicio
            </Link>
            <Link
              href="/#catalogo"
              onClick={() => trackNavigationClick('Catálogo Guerreros', '/#catalogo')}
              className="text-sm font-ui text-gray-300 hover:text-cyan-400 transition-colors flex items-center gap-1"
            >
              <span>💊</span> Catálogo Guerreros
            </Link>
            <Link
              href={paths.cacheDemo}
              onClick={() => trackNavigationClick('Lab Caché', paths.cacheDemo)}
              className="text-sm font-ui text-gray-300 hover:text-cyan-400 transition-colors flex items-center gap-1"
            >
              <span>⚡</span> Lab Caché
            </Link>
            <Link
              href={paths.landing.about}
              onClick={() => trackNavigationClick('Sobre Nosotros', paths.landing.about)}
              className="text-sm font-ui text-gray-300 hover:text-cyan-400 transition-colors"
            >
              Sobre Nosotros
            </Link>
            {user && (
              <>
                <Link
                  href={paths.dashboard}
                  onClick={() => trackNavigationClick('Mi Espacio', paths.dashboard)}
                  className="text-sm font-ui text-purple-300 font-semibold hover:text-purple-200 transition-colors"
                >
                  Mi Espacio
                </Link>
                <Link
                  href={paths.interno}
                  onClick={() => trackNavigationClick('Módulo Interno', paths.interno)}
                  className="text-sm font-ui text-pink-400 font-semibold hover:text-pink-300 transition-colors flex items-center gap-1"
                >
                  <span>🏛️</span> Módulo Interno
                </Link>
              </>
            )}
          </nav>

          {/* Acciones: Carrito de Compras + Estado de Autenticación */}
          <div className="flex items-center gap-3">
            
            {/* Botón Flotante del Carrito con Contador Badge */}
            <button
              type="button"
              onClick={openCart}
              className="relative p-1.5 rounded-xl bg-white/5 hover:bg-cyan-500/10 border border-white/10 hover:border-cyan-500/30 transition-all flex items-center gap-2 group cursor-pointer"
              aria-label="Abrir cápsulas de compras"
            >
              <span className="text-lg group-hover:scale-110 transition-transform">💊</span>
              <span className="hidden sm:inline text-xs font-mono font-medium text-gray-300 group-hover:text-cyan-300">
                Cápsulas
              </span>
              {totalItems > 0 && (
                <span className="w-5 h-5 rounded-full bg-cyan-500 text-gray-950 text-xs font-mono font-bold flex items-center justify-center animate-bounce">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Auth State */}
            {user ? (
              <div className="flex items-center gap-2.5">
                <Link
                  href={paths.dashboard}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-cyan-500/40 transition-colors"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-ui font-medium text-white">
                    {user.name.split(' ')[0]}
                  </span>
                  <span
                    className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${getLevelBadge(
                      user.graduationLevel
                    )}`}
                  >
                    {user.graduationLevel}
                  </span>
                </Link>

                <button
                  type="button"
                  onClick={() => logout()}
                  className="text-xs font-ui text-gray-400 hover:text-red-400 px-2 py-1.5 rounded-lg transition-colors"
                  title="Cerrar sesión"
                >
                  Salir
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsLoginOpen(true)}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-ui font-bold text-xs sm:text-sm shadow-md shadow-cyan-500/20 transition-all active:scale-[0.98]"
              >
                Ingresar
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Modal de Login */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
      />
    </>
  );
}
