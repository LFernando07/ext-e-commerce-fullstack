// app/robots.ts
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: ['/', '/about/', '/cookies/'],
                disallow: ['/dashboard/', '/admin/', '/checkout/'], // Rutas privadas o protegidas
            },
        ],
        sitemap: 'https://localhost:3000/sitemap.xml',
    };
}