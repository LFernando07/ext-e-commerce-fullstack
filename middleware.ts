/**
 * @file middleware.ts
 * @description Next.js Edge Middleware para inspección de peticiones, inyección de headers y telemetría.
 * 
 * @concept Next.js Edge Middleware, Request/Response Interception, Security & Telemetry Headers
 * 
 * ¿Qué es y cómo funciona el Middleware en Next.js?
 * ─────────────────────────────────────────────────────────────────────────────
 * El archivo `middleware.ts` (ubicado en la raíz del proyecto) se ejecuta ANTES de que
 * cualquier petición llegue al motor de renderizado o a las rutas de API.
 * 
 * Características clave:
 * 1. Runtime Ultrarrápido: Se ejecuta en el Edge (servidores perimetrales cercanos al usuario).
 * 2. Manipulación de Headers: Podemos inyectar headers personalizados tanto en la petición (`request.headers`)
 *    como en la respuesta (`response.headers`).
 * 3. Matcher Granular: La exportación `config.matcher` define exactamente qué rutas son interceptadas,
 *    evitando ejecutar lógica innecesaria en assets estáticos (`_next/static`, `_next/image`, `favicon.ico`).
 * 4. Protección y Redirecciones: Puede verificar cookies de sesión compartidas (como `auth_token`)
 *    antes de permitir el acceso a módulos internos.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Clonar los headers de la petición para poder enriquecerlos
  const requestHeaders = new Headers(request.headers);
  const requestId = `req_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
  requestHeaders.set('x-request-id', requestId);
  requestHeaders.set('x-request-timestamp', new Date().toISOString());

  // 2. Generar o preservar una cookie de sesión de Capsule Corp
  const capsuleSession = request.cookies.get('capsule_session_id')?.value || `capsule_${Date.now().toString(36)}`;

  // 3. Crear la respuesta continuando la cadena de procesamiento de Next.js
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // 4. Inyectar Headers de Diagnóstico y Telemetría en la respuesta enviada al cliente
  response.headers.set('x-request-id', requestId);
  response.headers.set('x-capsule-corp-edge', 'active');
  response.headers.set('x-powered-by-architecture', 'Next.js 16 + PPR + Server Actions');

  // Si no existía cookie de sesión de Capsule Corp, la seteamos
  if (!request.cookies.has('capsule_session_id')) {
    response.cookies.set('capsule_session_id', capsuleSession, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30, // 30 días
    });
  }

  // 5. Telemetría de consola en entorno de desarrollo para aprendizaje
  if (process.env.NODE_ENV !== 'production' && !pathname.startsWith('/_next')) {
    console.log(
      `[Middleware Edge] Interceptado: ${request.method} ${pathname} | RequestID: ${requestId} | Sesión: ${capsuleSession}`
    );
  }

  return response;
}

/**
 * Configuración del Matcher:
 * Excluimos rutas internas de Next.js (_next/static, _next/image), favicon y archivos de imagen directos.
 */
export const config = {
  matcher: [
    /*
     * Coincide con todas las rutas excepto:
     * - _next/static (archivos estáticos)
     * - _next/image (optimización de imágenes)
     * - favicon.ico (icono del navegador)
     * - Imágenes y assets públicos con extensiones (.svg, .png, .jpg, .jpeg, .gif, .webp)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
