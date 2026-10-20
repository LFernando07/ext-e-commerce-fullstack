/**
 * @file lib/prisma.ts
 * @description Cliente de Prisma ORM configurado bajo el Patrón Singleton para Next.js.
 * 
 * @concept Prisma Singleton Pattern, PostgreSQL Connection Pooling, Supabase Integration
 * 
 * 🎓 ¿POR QUÉ ES OBLIGATORIO EL PATRÓN SINGLETON EN NEXT.JS?
 * ─────────────────────────────────────────────────────────────────────────────
 * Durante el desarrollo local (`next dev` con Turbopack o Webpack), cada vez que guardas
 * un archivo, Next.js recarga en caliente (Fast Refresh) los módulos de código.
 * 
 * Si hicieras:
 *    export const prisma = new PrismaClient();
 * 
 * En cada guardado se crearía una NUEVA instancia de PrismaClient con su propio grupo de
 * conexiones TCP a la base de datos PostgreSQL de Supabase. En pocos minutos agotarías
 * el límite de conexiones (Error: "Too many connections / Connection pool exhausted").
 * 
 * La solución estándar es almacenar la instancia única en el objeto global de Node (`globalThis`),
 * el cual sobrevive a los ciclos de recarga en caliente de Next.js.
 */

import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['error', 'warn']
        : ['error'],
  });
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton> | undefined;
} & typeof global;

export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma;
}

/**
 * Función utilitaria para comprobar si la base de datos de Supabase está configurada en .env.local
 */
export function isPrismaConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.length > 10);
}
