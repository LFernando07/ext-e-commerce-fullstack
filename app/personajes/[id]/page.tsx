/**
 * @file app/personajes/[id]/page.tsx
 * @description Ruta dinámica para la ficha técnica y compra de un guerrero en Capsule Corp.
 * 
 * @concept Next.js Dynamic Routes ([id]), generateStaticParams (SSG + ISR), generateMetadata, notFound()
 * 
 * 🎓 CONCEPTOS CLAVE IMPLEMENTADOS EN ESTA PÁGINA:
 * ─────────────────────────────────────────────────────────────────────────────
 * 1. Rutas Dinámicas (`[id]`):
 *    - Los corchetes `[id]` en el nombre de la carpeta indican a Next.js que este segmento
 *      es dinámico y captura el parámetro en `params.id`.
 * 
 * 2. `generateStaticParams()`:
 *    - En tiempo de compilación (`next build`), Next.js ejecuta esta función para generar
 *      archivos HTML estáticos para los personajes del 1 al 10.
 *    - Los personajes del 1 al 10 cargan en 0ms (como archivos estáticos en CDN).
 *    - Cualquier personaje con ID > 10 solicitado por primera vez se genera dinámicamente
 *      en el servidor (SSR) y se guarda en el Data Cache para futuras solicitudes.
 * 
 * 3. `generateMetadata()`:
 *    - Genera dinámicamente las etiquetas `<title>`, `<meta description>` y OpenGraph
 *      específicas para cada personaje para un SEO perfecto.
 * 
 * 4. `notFound()`:
 *    - Si la API responde 404 o el ID es inexistente, se dispara `notFound()` que renderiza
 *      automáticamente `not-found.tsx`.
 */

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getDBZCharacterById } from '@/lib/dragonball';
import CharacterDetailActions from '@/components/dbz/CharacterDetailActions';

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * Generación de parámetros estáticos en build time (SSG)
 * Pre-renderizamos los primeros 10 guerreros más populares (Goku, Vegeta, Piccolo, Bulma, Freezer, etc.)
 */
export async function generateStaticParams() {
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
    { id: '4' },
    { id: '5' },
    { id: '6' },
    { id: '7' },
    { id: '8' },
    { id: '9' },
    { id: '10' },
  ];
}

/**
 * Generación dinámica de Metadata y SEO
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const character = await getDBZCharacterById(id);

  if (!character) {
    return {
      title: 'Guerrero No Encontrado | Capsule Corp Tienda',
      description: 'El personaje solicitado no existe en la base de datos de Dragon Ball.',
    };
  }

  return {
    title: `${character.name} — Cápsula Hoi-Poi | Capsule Corp Tienda`,
    description: `Ficha técnica de ${character.name} (${character.race}). Ki: ${character.ki}. Adquiérelo en cápsula Hoi-Poi por ${character.formattedPrice}.`,
    openGraph: {
      title: `${character.name} — Cápsula Hoi-Poi`,
      description: character.description?.slice(0, 160),
      images: [character.image],
    },
  };
}

export default async function CharacterDetailPage({ params }: PageProps) {
  const { id } = await params;
  const character = await getDBZCharacterById(id);

  if (!character) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#0A0D14] text-white selection:bg-cyan-500/30 selection:text-white pb-20">
      
      {/* Barra de Navegación Contextual / Breadcrumbs */}
      <div className="border-b border-white/10 bg-[#0e121c]/80 backdrop-blur-md sticky top-16 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-12 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2 text-gray-400">
            <Link href="/" className="hover:text-cyan-400 transition-colors">
              Tienda Capsule Corp
            </Link>
            <span>/</span>
            <span className="text-gray-500">Personajes</span>
            <span>/</span>
            <span className="text-cyan-300 font-bold">{character.name}</span>
          </div>

          <span className="text-[11px] text-gray-400 hidden sm:inline">
            ID: #{character.id} • Next.js Dynamic Route
          </span>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 space-y-12">
        
        {/* Sección Superior: Imagen Hero + Ficha Comercial */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          
          {/* Contenedor de Imagen de Alta Definición con next/image */}
          <div className="relative h-[480px] rounded-3xl bg-gradient-to-b from-[#151B29] to-[#0D111A] border border-cyan-500/20 p-8 flex items-center justify-center overflow-hidden shadow-2xl group">
            {/* Aura de Ki animada */}
            <div className="absolute inset-0 bg-radial from-cyan-500/15 via-transparent to-transparent pointer-events-none" />
            
            <div className="relative w-full h-full">
              <Image
                src={character.image}
                alt={character.name}
                fill
                priority={true} // Prioridad máxima de carga para evitar LCP degradation
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-contain drop-shadow-[0_20px_40px_rgba(6,182,212,0.35)] transition-transform duration-500 group-hover:scale-105"
              />
            </div>

            {/* Badge de Nivel de Poder Flotante */}
            <div className="absolute bottom-5 left-5 right-5 p-3 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-between text-xs font-mono">
              <span className="text-gray-300">Nivel de Poder:</span>
              <span className="text-cyan-400 font-bold">{character.powerTier}</span>
            </div>
          </div>

          {/* Ficha Técnica y Acciones de Compra */}
          <div className="space-y-6">
            
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-400 text-xs font-mono">
                <span>💊 {character.capsuleType}</span>
                <span>•</span>
                <span>Stock: {character.stock} disponibles</span>
              </div>

              <h1 className="font-display font-bold text-4xl sm:text-5xl text-white tracking-tight">
                {character.name}
              </h1>

              <div className="flex items-center gap-3 text-sm font-mono text-gray-400">
                <span>Raza: <strong className="text-gray-200">{character.race}</strong></span>
                <span>•</span>
                <span>Género: <strong className="text-gray-200">{character.gender}</strong></span>
              </div>
            </div>

            {/* Grid de Atributos de Ki */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-[#131722] border border-white/5">
                <span className="text-[10px] font-mono uppercase text-gray-500 block">
                  Ki Base
                </span>
                <span className="font-mono font-bold text-sm text-cyan-300 truncate block mt-0.5">
                  {character.ki || 'N/A'}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#131722] border border-white/5">
                <span className="text-[10px] font-mono uppercase text-gray-500 block">
                  Ki Máximo
                </span>
                <span className="font-mono font-bold text-sm text-amber-300 truncate block mt-0.5">
                  {character.maxKi || 'Ilimitado'}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#131722] border border-white/5 col-span-2 sm:col-span-1">
                <span className="text-[10px] font-mono uppercase text-gray-500 block">
                  Afiliación
                </span>
                <span className="font-mono font-bold text-xs text-purple-300 truncate block mt-0.5">
                  {character.affiliation || 'Independiente'}
                </span>
              </div>
            </div>

            {/* Descripción Canónica */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 text-gray-300 text-xs sm:text-sm leading-relaxed">
              <p>{character.description}</p>
            </div>

            {/* Precio & Acciones de Compra (Client Component con Contexto) */}
            <CharacterDetailActions product={character} />

          </div>

        </div>

        {/* Sección: Planeta de Origen (si está disponible) */}
        {character.originPlanet && (
          <section className="p-6 sm:p-8 rounded-3xl bg-[#131722] border border-white/10 space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🪐</span>
              <div>
                <h3 className="font-display font-bold text-xl text-white">
                  Planeta de Origen: {character.originPlanet.name}
                </h3>
                <p className="text-xs text-gray-400 font-mono">
                  {character.originPlanet.isDestroyed ? '⚠️ Estado: Destruido en el canon' : '✅ Estado: Activo'}
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 items-center">
              {character.originPlanet.image && (
                <div className="relative w-full md:w-64 h-40 rounded-2xl overflow-hidden border border-white/10 flex-shrink-0">
                  <Image
                    src={character.originPlanet.image}
                    alt={character.originPlanet.name}
                    fill
                    sizes="256px"
                    className="object-cover"
                  />
                </div>
              )}
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                {character.originPlanet.description || 'Sin registros topográficos en los archivos de Capsule Corp.'}
              </p>
            </div>
          </section>
        )}

        {/* Sección: Transformaciones Canónicas */}
        {character.transformations && character.transformations.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-2xl text-white">
                  Fases de Transformación Desbloqueables
                </h3>
                <p className="text-xs text-cyan-400 font-mono">
                  Compatibles con la cápsula Hoi-Poi adquirida ({character.transformations.length} fases)
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {character.transformations.map((trans) => (
                <div
                  key={trans.id}
                  className="p-4 rounded-2xl bg-[#131722] border border-white/10 hover:border-cyan-500/40 transition-colors space-y-3 text-center"
                >
                  <div className="relative w-full h-40">
                    <Image
                      src={trans.image}
                      alt={trans.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-sm text-white truncate">
                      {trans.name}
                    </h4>
                    <span className="text-[11px] font-mono text-cyan-400 block mt-0.5">
                      Ki: {trans.ki || 'Aumentado'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Banner Pedagógico de Conceptos Next.js */}
        <section className="p-6 rounded-3xl bg-gradient-to-r from-blue-950/40 to-cyan-950/30 border border-cyan-500/30 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-cyan-400 font-mono font-bold text-xs uppercase tracking-wider">
              Arquitectura Next.js en Acción
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
            <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
              <span className="text-cyan-300 font-bold block">1. Dynamic Route ([id])</span>
              <p className="text-gray-400 text-[11px]">
                Esta URL resuelve el parámetro <code className="text-white">params.id = {character.id}</code> de forma tipada.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
              <span className="text-cyan-300 font-bold block">2. generateStaticParams()</span>
              <p className="text-gray-400 text-[11px]">
                Los IDs 1 al 10 se pre-generaron en build time (SSG). IDs mayores se generan bajo demanda (SSR con ISR).
              </p>
            </div>
            <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
              <span className="text-cyan-300 font-bold block">3. Data Cache Granular</span>
              <p className="text-gray-400 text-[11px]">
                Tagged como <code className="text-white">dbz-character-{character.id}</code> con 24h de tiempo de vida.
              </p>
            </div>
          </div>
        </section>

      </main>

    </div>
  );
}
