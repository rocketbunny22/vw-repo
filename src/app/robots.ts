import type { MetadataRoute } from 'next';
import { absoluteUrl, siteUrl } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin',
        '/api/',
        '/bookmarks',
        '/login',
        '/my-vw',
        '/profile',
        '/reset-password',
        '/signup',
        '/submit-guide',
        '/upload',
        '/es-mx/admin',
        '/es-mx/enviar-guia',
        '/es-mx/guardados',
        '/es-mx/iniciar-sesion',
        '/es-mx/mi-vw',
        '/es-mx/perfil',
        '/es-mx/registro',
        '/es-mx/restablecer-contrasena',
        '/es-mx/subir-pdf',
      ],
    },
    sitemap: absoluteUrl('/sitemap.xml'),
    host: siteUrl,
  };
}
