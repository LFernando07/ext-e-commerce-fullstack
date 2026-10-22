import { NenisUser } from '@/lib/auth/users';
import { API_ROUTES } from '@/config/routes';
import { RegisterPayload } from '@/types/general';
import { AbandonedCartEmailItem } from '@/lib/email';

// ─── PEDIDOS A PLAZOS (NENIS) ───
export type PedidoEstado = 'pendiente' | 'aprobado' | 'en_entrega' | 'completado' | 'cancelado';

export interface Pedido {
  id: string;
  neniId: string;
  clienteNombre: string;
  concepto: string;
  monto: number;
  plazosQuincenas: number;
  montoQuincenal: number;
  estado: PedidoEstado;
  fechaCreacion: string;
}

export interface CreatePedidoInput {
  clienteNombre: string;
  concepto: string;
  monto: number;
  plazosQuincenas: number;
  neniId?: string;
}

export interface UpdatePedidoInput {
  id: string;
  estado?: PedidoEstado;
  concepto?: string;
  monto?: number;
}

// ─── ÓRDENES DE COMPRA CAPSULE CORP ───
export interface CapsuleOrderItem {
  id: string;
  productId: number;
  name: string;
  quantity: number;
  unitPrice: number;
  image: string | null;
}

export interface CapsuleOrder {
  id: string;
  orderCode: string;
  customerName: string;
  address: string;
  paymentMethod: string;
  paymentStatus: string;
  stripeSessionId: string | null;
  stripePaymentIntentId: string | null;
  totalZeni: number;
  itemsPurchased: number;
  status: string;
  createdAt: string;
  items: CapsuleOrderItem[];
}

export interface OrdersStats {
  totalOrders: number;
  totalRevenue: number;
  paidCount: number;
  pendingCount: number;
}

// ─── CARRITOS ABANDONADOS ───
export interface CartItemData {
  productId?: number;
  id?: number;
  name: string;
  quantity: number;
  unitPrice?: number;
  priceInZeni?: number;
  image?: string | null;
}

export interface AbandonedCart {
  id: string;
  email: string;
  customerName: string;
  items: CartItemData[];
  totalZeni: number;
  recoveryToken: string;
  status: string;
  emailSent: boolean;
  emailSentAt: string | null;
  createdAt: string;
}

// ─── MÉTRICAS & KPIS ───
export interface AnalyticsKPIsResponse {
  totalViews: number;
  activeUsers: number;
  scrollBottomCount: number;
  leadsCount: number;
  retentionRate: string;
  error?: string;
}

export interface InternoMetricasResponse {
  success: boolean;
  data: {
    totalCarteraColocada: number;
    tasaRecuperacion: number;
    nenisActivas: number;
    solicitudesPendientes: number;
    nivelRiesgoGeneral: string;
  };
  auditoria: {
    usuario: string;
    email: string;
    rol: string;
    metodoAutenticacion: string;
    cookieOrigen: string;
    horaAcceso: string;
  };
}

// ─── CACHE REVALIDATION ───
export type RevalidateAction = 'revalidateTag' | 'revalidatePath';

export interface RevalidatePayload {
  action: RevalidateAction;
  target: string;
}

export interface RevalidateResponse {
  success: boolean;
  message?: string;
  layer?: string;
  timestamp?: string;
  error?: string;
}

// ─── SENTRY TEST ───
export interface SentryTestResponse {
  success: boolean;
  message?: string;
  eventId?: string;
  flushed?: boolean;
  organization?: string;
  project?: string;
  timestamp?: string;
  error?: string;
}

/**
 * Contrato centralizado de Endpoints para Type-Safety estricto
 * Las llaves se derivan de la constante API_ROUTES para evitar strings hardcodeados.
 */
export interface ApiEndpoints {
  [API_ROUTES.PEDIDOS]: {
    GET: {
      params?: {
        estado?: PedidoEstado;
        neniId?: string;
        search?: string;
      };
      response: {
        success: boolean;
        total: number;
        data: Pedido[];
      };
    };
    POST: {
      body: CreatePedidoInput;
      response: {
        success: boolean;
        message: string;
        data: Pedido;
      };
    };
    PUT: {
      body: UpdatePedidoInput;
      response: {
        success: boolean;
        message: string;
        data: Pedido;
      };
    };
    DELETE: {
      params: { id: string };
      response: {
        success: boolean;
        message: string;
        deletedId: string;
      };
    };
  };

  [API_ROUTES.AUTH_ME]: {
    GET: {
      response: {
        authenticated: boolean;
        user: Omit<NenisUser, 'password'> | null;
      };
    };
  };

  [API_ROUTES.AUTH_LOGIN]: {
    POST: {
      body: {
        email: string;
        password: string;
      };
      response: {
        success: boolean;
        user?: Omit<NenisUser, 'password'>;
        error?: string;
      };
    };
  };

  [API_ROUTES.AUTH_REGISTER]: {
    POST: {
      body: RegisterPayload;
      response: {
        success: boolean;
        user?: Omit<NenisUser, 'password'>;
        error?: string;
      };
    };
  };

  [API_ROUTES.AUTH_FORGOT_PASSWORD]: {
    POST: {
      body: {
        email: string;
      };
      response: {
        success: boolean;
        message?: string;
        devResetUrl?: string;
        error?: string;
      };
    };
  };

  [API_ROUTES.AUTH_RESET_PASSWORD]: {
    POST: {
      body: {
        token: string;
        password: string;
      };
      response: {
        success: boolean;
        message?: string;
        error?: string;
      };
    };
  };

  [API_ROUTES.AUTH_LOGOUT]: {
    POST: {
      body?: undefined;
      response: {
        success: boolean;
      };
    };
  };

  [API_ROUTES.LEADS]: {
    POST: {
      body: {
        email: string;
        name?: string;
      };
      response: {
        success: boolean;
        message: string;
      };
    };
  };

  [API_ROUTES.INTERNO_METRICAS]: {
    GET: {
      response: InternoMetricasResponse;
    };
  };

  [API_ROUTES.CAPSULE_ORDERS]: {
    GET: {
      params?: {
        paymentStatus?: string;
        search?: string;
      };
      response: {
        orders: CapsuleOrder[];
        stats: OrdersStats;
        error?: string;
      };
    };
    PATCH: {
      body: {
        id: string;
        status?: string;
        paymentStatus?: string;
      };
      response: {
        success: boolean;
        order?: CapsuleOrder;
        error?: string;
      };
    };
    POST: {
      body: {
        orderId: string;
        email: string;
      };
      response: {
        success: boolean;
        mocked?: boolean;
        error?: string;
      };
    };
  };

  [API_ROUTES.CART_SYNC]: {
    POST: {
      body: {
        items: Array<{
          productId: number;
          name: string;
          priceInZeni: number;
          quantity: number;
          image?: string | null;
        }>;
        totalZeni: number;
        email?: string;
        customerName?: string;
        userId?: string;
      };
      response: {
        success: boolean;
        cartId?: string;
        recoveryToken?: string;
        mocked?: boolean;
        message?: string;
        error?: string;
      };
    };
  };

  [API_ROUTES.CART_ABANDONED]: {
    GET: {
      response: {
        success: boolean;
        source?: string;
        carts?: AbandonedCart[];
        error?: string;
      };
    };
    POST: {
      body: {
        cartId?: string;
        email?: string;
        customerName?: string;
        items?: AbandonedCartEmailItem[];
        totalZeni?: number;
        customRecipient?: string;
      };
      response: {
        success: boolean;
        mocked?: boolean;
        recoveryUrl?: string;
        error?: string;
      };
    };
  };

  [API_ROUTES.CART_RECOVER]: {
    GET: {
      params: {
        token: string;
      };
      response: {
        success: boolean;
        cart?: {
          id: string;
          email: string;
          customerName: string;
          items: unknown[];
          totalZeni: number;
          recoveryToken: string;
        };
        error?: string;
      };
    };
  };

  [API_ROUTES.CART_ABANDON_ORDER]: {
    POST: {
      body: {
        orderCode: string;
      };
      response: {
        success: boolean;
        recoveryToken?: string;
        recoveryUrl?: string;
        emailSent?: boolean;
        emailId?: string;
        message?: string;
        mocked?: boolean;
        error?: string;
      };
    };
  };

  [API_ROUTES.ANALYTICS_KPIS]: {
    GET: {
      response: AnalyticsKPIsResponse;
    };
  };

  [API_ROUTES.SENTRY_TEST]: {
    GET: {
      response: SentryTestResponse;
    };
  };

  [API_ROUTES.CACHE_REVALIDATE]: {
    POST: {
      body: RevalidatePayload;
      response: RevalidateResponse;
    };
  };
}
