/**
 * @file lib/supabase.ts
 * @description Cliente de Supabase para Node.js y navegador (Storage, Auth, Realtime).
 * 
 * @concept Supabase JS Client, Supabase Storage, Client/Server Interop
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

/**
 * Cliente público de Supabase para uso tanto en el navegador como en el servidor
 */
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
);

/**
 * Helper para verificar si las credenciales de Supabase están listas
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')
  );
}

/**
 * Utilidad para subir archivos a un bucket de Supabase Storage
 * 
 * @param bucket - Nombre del bucket en Supabase (ej. 'capsule-images')
 * @param path - Ruta/nombre del archivo dentro del bucket
 * @param file - Archivo en formato File o Buffer
 */
export async function uploadToSupabaseStorage(
  bucket: string,
  path: string,
  file: File | Blob | ArrayBuffer
): Promise<{ url: string | null; error: string | null }> {
  if (!isSupabaseConfigured()) {
    return {
      url: null,
      error: 'Supabase no está configurado en las variables de entorno.',
    };
  }

  try {
    const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
      upsert: true,
    });

    if (error) {
      return { url: null, error: error.message };
    }

    const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
    return { url: publicUrlData.publicUrl, error: null };
  } catch (err) {
    return { url: null, error: (err as Error).message };
  }
}
