import { NenisUser } from '@/lib/auth/users';
import { API_ROUTES } from '@/config/routes';

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
      response: {
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
      };
    };
  };
}
