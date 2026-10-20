import { ApiEndpoints } from '@/types/api';

// Re-exportamos los endpoints para que quien importe `api` tenga acceso directo a las constantes
export { API_ROUTES, API_ROUTES as ENDPOINTS } from '@/config/routes';

// Métodos HTTP como constantes tipadas
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH',
} as const;

export type HttpMethod = (typeof HTTP_METHODS)[keyof typeof HTTP_METHODS];

// Constantes de cabeceras comunes
export const HTTP_HEADERS = {
  CONTENT_TYPE_JSON: 'application/json',
} as const;

export interface NextFetchConfig {
  revalidate?: number | false;
  tags?: string[];
}

// Filtra únicamente las rutas que tienen implementado el método M
export type EndpointsWithMethod<M extends HttpMethod> = {
  [Path in keyof ApiEndpoints]: M extends keyof ApiEndpoints[Path] ? Path : never;
}[keyof ApiEndpoints];

// Extrae el tipo del body si está definido para esa ruta y método
export type BodyType<Path extends keyof ApiEndpoints, M extends keyof ApiEndpoints[Path]> =
  ApiEndpoints[Path][M] extends { body: infer B } ? B : never;

// Extrae el tipo de parámetros de búsqueda si están definidos
export type ParamsType<Path extends keyof ApiEndpoints, M extends keyof ApiEndpoints[Path]> =
  ApiEndpoints[Path][M] extends { params?: infer P }
    ? P
    : Record<string, string | number | boolean | undefined>;

// Extrae el tipo de retorno fuertemente tipado
export type ResponseType<Path extends keyof ApiEndpoints, M extends keyof ApiEndpoints[Path]> =
  ApiEndpoints[Path][M] extends { response: infer R } ? R : void;

// Opciones de configuración de la petición
export interface RequestOptions<Path extends keyof ApiEndpoints, M extends keyof ApiEndpoints[Path]> {
  params?: ParamsType<Path, M>;
  headers?: HeadersInit;
  cache?: RequestCache;
  next?: NextFetchConfig;
}

/**
 * Cliente HTTP universal para Next.js (funciona tanto en Client Components como Server Components)
 */
export async function apiRequest<
  Path extends keyof ApiEndpoints,
  Method extends keyof ApiEndpoints[Path] & HttpMethod
>(
  endpoint: Path,
  method: Method,
  options?: {
    bodyData?: BodyType<Path, Method>;
    params?: Record<string, any>;
    headers?: HeadersInit;
    cache?: RequestCache;
    next?: NextFetchConfig;
  }
): Promise<ResponseType<Path, Method>> {
  const baseUrl =
    typeof window !== 'undefined'
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const url = new URL(endpoint as string, baseUrl);

  if (options?.params) {
    Object.entries(options.params).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        url.searchParams.append(key, String(val));
      }
    });
  }

  const config: RequestInit & { next?: NextFetchConfig } = {
    method,
    headers: {
      'Content-Type': HTTP_HEADERS.CONTENT_TYPE_JSON,
      ...(options?.headers || {}),
    },
    cache: options?.cache,
    next: options?.next,
  };

  if (options?.bodyData !== undefined) {
    config.body = JSON.stringify(options.bodyData);
  }

  const response = await fetch(url.toString(), config);

  if (!response.ok) {
    let errorMsg = `Error HTTP ${response.status}: ${response.statusText}`;
    try {
      const errJson = await response.json();
      if (errJson?.message || errJson?.error) {
        errorMsg = errJson.message || errJson.error;
      }
    } catch {
      // Ignorar
    }
    throw new Error(errorMsg);
  }

  if (response.status === 204) {
    return {} as ResponseType<Path, Method>;
  }

  return (await response.json()) as ResponseType<Path, Method>;
}

/**
 * Instancia `api` con métodos semánticos estrictamente tipados.
 * Admite tanto constantes tipadas (`ENDPOINTS.PEDIDOS`) como strings literales (`'/api/pedidos'`).
 */
export const api = {
  get: <Path extends EndpointsWithMethod<typeof HTTP_METHODS.GET>>(
    endpoint: Path,
    options?: RequestOptions<Path, typeof HTTP_METHODS.GET & keyof ApiEndpoints[Path]>
  ): Promise<ResponseType<Path, typeof HTTP_METHODS.GET & keyof ApiEndpoints[Path]>> =>
    apiRequest(endpoint as any, HTTP_METHODS.GET, options as any) as Promise<
      ResponseType<Path, typeof HTTP_METHODS.GET & keyof ApiEndpoints[Path]>
    >,

  post: <Path extends EndpointsWithMethod<typeof HTTP_METHODS.POST>>(
    endpoint: Path,
    bodyData: BodyType<Path, typeof HTTP_METHODS.POST & keyof ApiEndpoints[Path]>,
    options?: RequestOptions<Path, typeof HTTP_METHODS.POST & keyof ApiEndpoints[Path]>
  ): Promise<ResponseType<Path, typeof HTTP_METHODS.POST & keyof ApiEndpoints[Path]>> =>
    apiRequest(endpoint as any, HTTP_METHODS.POST, { bodyData, ...options } as any) as Promise<
      ResponseType<Path, typeof HTTP_METHODS.POST & keyof ApiEndpoints[Path]>
    >,

  put: <Path extends EndpointsWithMethod<typeof HTTP_METHODS.PUT>>(
    endpoint: Path,
    bodyData: BodyType<Path, typeof HTTP_METHODS.PUT & keyof ApiEndpoints[Path]>,
    options?: RequestOptions<Path, typeof HTTP_METHODS.PUT & keyof ApiEndpoints[Path]>
  ): Promise<ResponseType<Path, typeof HTTP_METHODS.PUT & keyof ApiEndpoints[Path]>> =>
    apiRequest(endpoint as any, HTTP_METHODS.PUT, { bodyData, ...options } as any) as Promise<
      ResponseType<Path, typeof HTTP_METHODS.PUT & keyof ApiEndpoints[Path]>
    >,

  delete: <Path extends EndpointsWithMethod<typeof HTTP_METHODS.DELETE>>(
    endpoint: Path,
    options?: RequestOptions<Path, typeof HTTP_METHODS.DELETE & keyof ApiEndpoints[Path]> & {
      bodyData?: BodyType<Path, typeof HTTP_METHODS.DELETE & keyof ApiEndpoints[Path]>;
    }
  ): Promise<ResponseType<Path, typeof HTTP_METHODS.DELETE & keyof ApiEndpoints[Path]>> =>
    apiRequest(endpoint as any, HTTP_METHODS.DELETE, options as any) as Promise<
      ResponseType<Path, typeof HTTP_METHODS.DELETE & keyof ApiEndpoints[Path]>
    >,
};
