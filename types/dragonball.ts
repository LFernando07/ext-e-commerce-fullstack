/**
 * @file types/dragonball.ts
 * @description Contratos de tipado para la API pública de Dragon Ball Z y el modelo de E-Commerce.
 * @concept TypeScript Strict Contracts & Data Modeling
 */

export interface DBZCharacter {
  id: number;
  name: string;
  ki: string;
  maxKi: string;
  race: string;
  gender: string;
  description: string;
  image: string;
  affiliation: string;
  deletedAt: string | null;
}

export interface DBZTransformation {
  id: number;
  name: string;
  image: string;
  ki: string;
  deletedAt: string | null;
}

export interface DBZPlanet {
  id: number;
  name: string;
  isDestroyed: boolean;
  description: string;
  image: string;
  deletedAt: string | null;
}

export interface DBZCharacterDetail extends DBZCharacter {
  originPlanet?: DBZPlanet;
  transformations?: DBZTransformation[];
}

export interface DBZApiResponse {
  items: DBZCharacter[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
  links: {
    first: string;
    previous: string;
    next: string;
    last: string;
  };
}

/**
 * Modelo de producto enriquecido para el E-Commerce
 * Combina la información canónica de la API con atributos comerciales de Capsule Corp.
 */
export interface ECommerceProduct extends DBZCharacter {
  priceInZeni: number;
  formattedPrice: string;
  stock: number;
  capsuleType: 'Hoi-Poi Básica' | 'Hoi-Poi Premium' | 'Hoi-Poi Legendaria';
  powerTier: 'Nivel Z (Supremo)' | 'Nivel S (Guerrero)' | 'Nivel A (Avanzado)' | 'Nivel B (Básico)';
}

export interface CartItem {
  product: ECommerceProduct;
  quantity: number;
  addedAt: string;
}

export interface CartState {
  items: CartItem[];
  totalZeni: number;
  totalItems: number;
}

export interface CheckoutResult {
  success: boolean;
  orderId?: string;
  customerName?: string;
  totalZeni?: number;
  itemsPurchased?: number;
  message: string;
  error?: string;
}
