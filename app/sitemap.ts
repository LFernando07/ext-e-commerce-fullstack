import { MetadataRoute } from 'next';

// Extraemos el tipo exacto que Next.js espera para las frecuencias. 
type ChangeFrequency = MetadataRoute.Sitemap[number]['changeFrequency'];

// Centralizamos los valores en un objeto de configuración reusable.
// Usamos "as const" para que TypeScript recuerde los valores literales exactos.
const SEO_FREQUENCIES = {
  year: 'yearly',
  month: 'monthly',
  week: 'weekly',
  day: 'daily',
  hour: 'hourly',
  always: 'always',
  never: 'never',
} as const satisfies Record<string, ChangeFrequency>; 

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'http://localhost:3000';

  // Rutas fijas / estáticas
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: SEO_FREQUENCIES.year,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: SEO_FREQUENCIES.day,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/cookies`,
      lastModified: new Date(),
      changeFrequency: SEO_FREQUENCIES.month,
      priority: 0.3,
    },
  ];

  // Rutas dinámicas (obtenidas de BD o API)
  // const catalogos = await getCatalogos();
  const catalogos = [{ slug: 'ropa-dama', updatedAt: '2026-09-01' }];

  const dynamicRoutes: MetadataRoute.Sitemap = catalogos.map((cat) => ({
    url: `${baseUrl}/catalogo/${cat.slug}`,
    lastModified: new Date(cat.updatedAt),
    changeFrequency: SEO_FREQUENCIES.week,
    priority: 0.7,
  }));

  return [...staticRoutes, ...dynamicRoutes];
}