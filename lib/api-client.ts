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

export type QueryParamValue = string | number | boolean | undefined | null;
export type QueryParams = Record<string, QueryParamValue>;

// Filtra únicamente las rutas que tienen implementado el método M
export type EndpointsWithMethod<M extends HttpMethod> = {
  [Path in keyof ApiEndpoints]: M extends keyof ApiEndpoints[Path] ? Path : never;
}[keyof ApiEndpoints];

// Extrae el tipo del body si está definido para esa ruta y método
export type BodyType<Path extends keyof ApiEndpoints, M extends HttpMethod> =
  M extends keyof ApiEndpoints[Path]
    ? ApiEndpoints[Path][M] extends { body: infer B }
      ? B
      : never
    : never;

// Extrae el tipo de parámetros de búsqueda si están definidos
export type ParamsType<Path extends keyof ApiEndpoints, M extends HttpMethod> =
  M extends keyof ApiEndpoints[Path]
    ? ApiEndpoints[Path][M] extends { params?: infer P }
      ? P
      : QueryParams
    : QueryParams;

// Extrae el tipo de retorno fuertemente tipado
export type ResponseType<Path extends keyof ApiEndpoints, M extends HttpMethod> =
  M extends keyof ApiEndpoints[Path]
    ? ApiEndpoints[Path][M] extends { response: infer R }
      ? R
      : void
    : void;

// Opciones de configuración genéricas para cualquier petición HTTP
export interface GenericRequestOptions {
  params?: QueryParams;
  headers?: HeadersInit;
  cache?: RequestCache;
  next?: NextFetchConfig;
}

// Opciones de configuración de la petición fuertemente tipadas según el endpoint
export interface RequestOptions<Path extends keyof ApiEndpoints, M extends HttpMethod> {
  params?: ParamsType<Path, M>;
  headers?: HeadersInit;
  cache?: RequestCache;
  next?: NextFetchConfig;
}

/**
 * Cliente HTTP universal para Next.js (funciona tanto en Client Components como Server Components)
 */
export async function rawApiRequest<TResponse = unknown>(
  endpoint: string,
  method: HttpMethod,
  options?: {
    bodyData?: unknown;
    params?: QueryParams;
    headers?: HeadersInit;
    cache?: RequestCache;
    next?: NextFetchConfig;
  }
): Promise<TResponse> {
  const baseUrl =
    typeof window !== 'undefined'
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const url = new URL(endpoint, baseUrl);

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
      const errJson = (await response.json()) as { message?: string; error?: string };
      if (errJson?.message || errJson?.error) {
        errorMsg = errJson.message || errJson.error || errorMsg;
      }
    } catch {
      // Ignorar fallback de JSON si la respuesta fue HTML u otro formato
    }
    throw new Error(errorMsg);
  }

  if (response.status === 204) {
    return {} as TResponse;
  }

  return (await response.json()) as TResponse;
}

/**
 * Helper tipado directamente con el diccionario de ApiEndpoints
 */
export async function apiRequest<
  Path extends keyof ApiEndpoints,
  Method extends keyof ApiEndpoints[Path] & HttpMethod
>(
  endpoint: Path,
  method: Method,
  options?: {
    bodyData?: BodyType<Path, Method>;
    params?: ParamsType<Path, Method>;
    headers?: HeadersInit;
    cache?: RequestCache;
    next?: NextFetchConfig;
  }
): Promise<ResponseType<Path, Method>> {
  return rawApiRequest<ResponseType<Path, Method>>(
    endpoint,
    method,
    options as GenericRequestOptions & { bodyData?: unknown }
  );
}

export interface ApiClient {
  get<Path extends EndpointsWithMethod<'GET'>>(
    endpoint: Path,
    options?: RequestOptions<Path, 'GET'>
  ): Promise<ResponseType<Path, 'GET'>>;
  get<TResponse = unknown>(
    endpoint: string,
    options?: GenericRequestOptions
  ): Promise<TResponse>;

  post<Path extends EndpointsWithMethod<'POST'>>(
    endpoint: Path,
    bodyData: BodyType<Path, 'POST'>,
    options?: RequestOptions<Path, 'POST'>
  ): Promise<ResponseType<Path, 'POST'>>;
  post<TResponse = unknown, TBody = unknown>(
    endpoint: string,
    bodyData?: TBody,
    options?: GenericRequestOptions
  ): Promise<TResponse>;

  put<Path extends EndpointsWithMethod<'PUT'>>(
    endpoint: Path,
    bodyData: BodyType<Path, 'PUT'>,
    options?: RequestOptions<Path, 'PUT'>
  ): Promise<ResponseType<Path, 'PUT'>>;
  put<TResponse = unknown, TBody = unknown>(
    endpoint: string,
    bodyData?: TBody,
    options?: GenericRequestOptions
  ): Promise<TResponse>;

  patch<Path extends EndpointsWithMethod<'PATCH'>>(
    endpoint: Path,
    bodyData: BodyType<Path, 'PATCH'>,
    options?: RequestOptions<Path, 'PATCH'>
  ): Promise<ResponseType<Path, 'PATCH'>>;
  patch<TResponse = unknown, TBody = unknown>(
    endpoint: string,
    bodyData?: TBody,
    options?: GenericRequestOptions
  ): Promise<TResponse>;

  delete<Path extends EndpointsWithMethod<'DELETE'>>(
    endpoint: Path,
    options?: RequestOptions<Path, 'DELETE'> & {
      bodyData?: BodyType<Path, 'DELETE'>;
    }
  ): Promise<ResponseType<Path, 'DELETE'>>;
  delete<TResponse = unknown>(
    endpoint: string,
    options?: GenericRequestOptions & { bodyData?: unknown }
  ): Promise<TResponse>;

  raw: typeof rawApiRequest;
}

/**
 * Instancia `api` con métodos semánticos estrictamente tipados.
 * Admite tanto constantes tipadas (`ENDPOINTS.CAPSULE_ORDERS`) como strings literales (`'/api/capsule-orders'`).
 */
export const api: ApiClient = {
  get: <TResponse = unknown>(
    endpoint: string,
    options?: GenericRequestOptions
  ): Promise<TResponse> => rawApiRequest<TResponse>(endpoint, HTTP_METHODS.GET, options),

  post: <TResponse = unknown, TBody = unknown>(
    endpoint: string,
    bodyData?: TBody,
    options?: GenericRequestOptions
  ): Promise<TResponse> =>
    rawApiRequest<TResponse>(endpoint, HTTP_METHODS.POST, { bodyData, ...options }),

  put: <TResponse = unknown, TBody = unknown>(
    endpoint: string,
    bodyData?: TBody,
    options?: GenericRequestOptions
  ): Promise<TResponse> =>
    rawApiRequest<TResponse>(endpoint, HTTP_METHODS.PUT, { bodyData, ...options }),

  patch: <TResponse = unknown, TBody = unknown>(
    endpoint: string,
    bodyData?: TBody,
    options?: GenericRequestOptions
  ): Promise<TResponse> =>
    rawApiRequest<TResponse>(endpoint, HTTP_METHODS.PATCH, { bodyData, ...options }),

  delete: <TResponse = unknown>(
    endpoint: string,
    options?: GenericRequestOptions & { bodyData?: unknown }
  ): Promise<TResponse> =>
    rawApiRequest<TResponse>(endpoint, HTTP_METHODS.DELETE, options),

  raw: rawApiRequest,
};
