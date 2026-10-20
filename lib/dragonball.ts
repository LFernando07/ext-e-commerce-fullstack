/**
 * @file lib/dragonball.ts
 * @description Capa de datos y servicio para consumir la API pública de Dragon Ball Z
 * y enriquecer a los guerreros como productos comerciables de Capsule Corp.
 * 
 * @concept Next.js Data Cache, Fetch with Tags, Incremental Static Regeneration (ISR)
 * 
 * Conceptos clave de Next.js demostrados aquí:
 * 1. Data Cache (`fetch` con opciones `next: { tags, revalidate }`):
 *    - Los personajes se guardan en el Data Cache del servidor de Next.js.
 *    - Se asocian a tags semánticos ('dbz-characters', 'dbz-character-[id]') para permitir
 *      revalidación granular bajo demanda (`revalidateTag`).
 * 2. Enriquecimiento Determinista:
 *    - Calculamos precios en Zeni y stock a partir del ID y Ki del personaje.
 *    - Al ser determinista (misma entrada = misma salida), evita discrepancias de hidratación
 *      (Hydration Mismatch) entre el servidor y el cliente.
 */

import {
  DBZApiResponse,
  DBZCharacter,
  DBZCharacterDetail,
  ECommerceProduct,
} from '@/types/dragonball';

const DBZ_API_BASE_URL = process.env.DBZ_API_BASE_URL;

/**
 * Calcula de forma determinista el precio en Zeni y atributos comerciales
 * para evitar Hydration Mismatch entre SSR y Client.
 */
export function enrichCharacter(character: DBZCharacter): ECommerceProduct {
  // Fórmula determinista para el precio: Base 2,500 Zeni + modulación por ID y longitud de nombre
  const baseFactor = (character.id * 733) % 45000;
  const kiFactor = character.ki ? Math.min(character.ki.length * 1500, 30000) : 5000;
  const priceInZeni = 5000 + baseFactor + kiFactor;

  // Stock determinista entre 3 y 48 unidades
  const stock = 3 + ((character.id * 17) % 46);

  // Clasificación de Cápsula según su raza / nivel de Ki
  let capsuleType: ECommerceProduct['capsuleType'] = 'Hoi-Poi Básica';
  let powerTier: ECommerceProduct['powerTier'] = 'Nivel B (Básico)';

  const normalizedKi = character.ki?.toLowerCase() || '';
  if (
    normalizedKi.includes('billion') ||
    normalizedKi.includes('septillion') ||
    character.race?.toLowerCase().includes('saiyan') ||
    character.race?.toLowerCase().includes('god')
  ) {
    capsuleType = 'Hoi-Poi Legendaria';
    powerTier = 'Nivel Z (Supremo)';
  } else if (
    normalizedKi.includes('million') ||
    character.race?.toLowerCase().includes('namekian') ||
    character.race?.toLowerCase().includes('android')
  ) {
    capsuleType = 'Hoi-Poi Premium';
    powerTier = 'Nivel S (Guerrero)';
  } else if (character.race?.toLowerCase().includes('human')) {
    capsuleType = 'Hoi-Poi Básica';
    powerTier = 'Nivel A (Avanzado)';
  }

  return {
    ...character,
    priceInZeni,
    formattedPrice: new Intl.NumberFormat('es-MX', {
      style: 'decimal',
      maximumFractionDigits: 0,
    }).format(priceInZeni) + ' Zeni',
    stock,
    capsuleType,
    powerTier,
  };
}

/**
 * Obtiene la lista de personajes con soporte de filtros y Data Cache de Next.js
 * 
 * @param options - Opciones de paginación y filtrado
 * @returns Lista de productos enriquecidos y metadatos de paginación
 */
export async function getDBZCharacters(options?: {
  limit?: number;
  page?: number;
  race?: string;
  affiliation?: string;
}): Promise<{ products: ECommerceProduct[]; meta: DBZApiResponse['meta'] }> {
  const limit = options?.limit ?? 16;
  const page = options?.page ?? 1;

  // Validamos que la URL de la api no este vacia
    if (!DBZ_API_BASE_URL) {
      throw new Error('URL de Dragon Ball API no válida');
    }

  // Construimos la URL de la API con parámetros de búsqueda
  const url = new URL(`${DBZ_API_BASE_URL}/characters`);
  url.searchParams.set('limit', limit.toString());
  url.searchParams.set('page', page.toString());

  // Filtros opcionales
  if (options?.race && options.race !== 'all') {
    url.searchParams.set('race', options.race);
  }
  if (options?.affiliation && options.affiliation !== 'all') {
    url.searchParams.set('affiliation', options.affiliation);
  }

  try {
    // Next.js Data Cache: cacheamos la respuesta con tags granulares por página
    // ISR cada 1 hora para la lista de personajes
    const res = await fetch(url.toString(), {
      next: {
        tags: ['dbz-characters', `dbz-page-${page}`],
        revalidate: 3600, // ISR cada 1 hora
      },
    });

    if (!res.ok) {
      throw new Error(`Error al consultar Dragon Ball API: ${res.statusText} (${res.status})`);
    }

    const data: DBZApiResponse = await res.json();
    const products = data.items.map(enrichCharacter);

    return {
      products,
      meta: data.meta,
    };
  } catch (error) {
    console.error('[lib/dragonball.ts] Error en getDBZCharacters:', error);
    // Retornamos fallback vacío en caso de falla de red para no quebrar la app
    return {
      products: [],
      meta: {
        totalItems: 0,
        itemCount: 0,
        itemsPerPage: limit,
        totalPages: 0,
        currentPage: page,
      },
    };
  }
}

/**
 * Obtiene el detalle completo de un personaje por su ID (incluye planeta y transformaciones)
 * 
 * @param id - Identificador numérico o string del personaje
 * @returns Producto detallado o null si no se encuentra
 */
export async function getDBZCharacterById(
  id: string | number
): Promise<(ECommerceProduct & DBZCharacterDetail) | null> {
  const cleanId = String(id).trim();

  try {
    // ISR
    const res = await fetch(`${DBZ_API_BASE_URL}/characters/${cleanId}`, {
      next: {
        tags: ['dbz-characters', `dbz-character-${cleanId}`],
        revalidate: 86400, // Cache de 24 horas para personajes individuales
      },
    });

    if (res.status === 404) {
      return null;
    }

    if (!res.ok) {
      throw new Error(`Error en getDBZCharacterById: ${res.status}`);
    }

    const data: DBZCharacterDetail = await res.json();
    const enrichedBase = enrichCharacter(data);

    return {
      ...data,
      ...enrichedBase,
      transformations: data.transformations || [],
      originPlanet: data.originPlanet,
    };
  } catch (error) {
    console.error(`[lib/dragonball.ts] Error al obtener personaje ${cleanId}:`, error);
    return null;
  }
}
