export type SiteLocale = 'en' | 'es-MX';

const directEnglishToSpanish: Record<string, string> = {
  '/': '/es-mx',
  '/guides': '/es-mx/guias',
  '/library': '/es-mx/biblioteca',
  '/search': '/es-mx/buscar',
  '/profile': '/es-mx/perfil',
  '/feedback': '/es-mx/comentarios',
  '/submit-guide': '/es-mx/enviar-guia',
  '/login': '/es-mx/iniciar-sesion',
  '/signup': '/es-mx/registro',
  '/reset-password': '/es-mx/restablecer-contrasena',
  '/my-vw': '/es-mx/mi-vw',
  '/bookmarks': '/es-mx/guardados',
  '/upload': '/es-mx/subir-pdf',
  '/admin': '/es-mx/admin',
  '/privacy-policy': '/es-mx/politica-de-privacidad',
  '/terms-of-use': '/es-mx/terminos-de-uso',
};

const directSpanishToEnglish = Object.fromEntries(
  Object.entries(directEnglishToSpanish).map(([englishPath, spanishPath]) => [spanishPath, englishPath]),
) as Record<string, string>;

export const generationSlugsEs: Record<string, string> = {
  mk1: 'mk1', mk2: 'mk2', mk3: 'mk3', mk4: 'mk4', mk5: 'mk5', mk6: 'mk6', mk7: 'mk7', mk8: 'mk8',
  type1: 'tipo-1', type2: 'tipo-2', aircooled: 'enfriados-por-aire', watercooled: 'enfriados-por-agua',
};

export const systemSlugsEs: Record<string, string> = {
  engine: 'motor', suspension: 'suspension', brakes: 'frenos', electrical: 'sistema-electrico',
  transmission: 'transmision', body: 'carroceria', cooling: 'enfriamiento',
};

export const guideSlugsEs: Record<string, string> = {
  'mk1-gti-carburetor-rebuild': 'reconstruir-carburador-mk1-gti',
  'mk4-gti-18t-turbo-replacement': 'reemplazo-turbo-mk4-gti-18t',
  'mk1-golf-suspension-lowering': 'bajar-suspension-golf-mk1',
  'type1-beetle-floor-pan-replacement': 'reemplazo-pisos-volkswagen-tipo-1',
  'mk2-gti-brake-upgrade': 'mejora-frenos-mk2-gti',
  'mk3-vr6-timing-belt': 'cadenas-distribucion-mk3-vr6',
};

export function isSpanishPath(pathname: string) {
  return pathname === '/es-mx' || pathname.startsWith('/es-mx/');
}

export function toSpanishPath(pathname: string) {
  const { path, query } = splitPath(pathname);
  const direct = directEnglishToSpanish[path];
  if (direct) return `${direct}${query}`;

  if (path.startsWith('/generation/')) {
    return `/es-mx/generaciones/${generationSlugsEs[path.slice('/generation/'.length)] || path.slice('/generation/'.length)}${localizeQuery(query, 'es-MX')}`;
  }
  if (path.startsWith('/systems/')) {
    return `/es-mx/sistemas/${systemSlugsEs[path.slice('/systems/'.length)] || path.slice('/systems/'.length)}${localizeQuery(query, 'es-MX')}`;
  }
  if (path.startsWith('/guides/')) {
    return `/es-mx/guias/${guideSlugsEs[path.slice('/guides/'.length)] || path.slice('/guides/'.length)}${query}`;
  }
  if (path.startsWith('/users/')) {
    return `/es-mx/usuarios/${path.slice('/users/'.length)}${query}`;
  }

  return '/es-mx';
}

export function toEnglishPath(pathname: string) {
  const { path, query } = splitPath(pathname);
  if (Object.prototype.hasOwnProperty.call(directEnglishToSpanish, path)) {
    return `${path}${query}`;
  }

  const direct = directSpanishToEnglish[path];
  if (direct) return `${direct}${query}`;

  if (!path.startsWith('/es-mx/')) {
    return `${path}${query}`;
  }

  if (path.startsWith('/es-mx/generaciones/')) {
    const slug = path.slice('/es-mx/generaciones/'.length);
    return `/generation/${englishSlug(generationSlugsEs, slug)}${localizeQuery(query, 'en')}`;
  }
  if (path.startsWith('/es-mx/sistemas/')) {
    const slug = path.slice('/es-mx/sistemas/'.length);
    return `/systems/${englishSlug(systemSlugsEs, slug)}${localizeQuery(query, 'en')}`;
  }
  if (path.startsWith('/es-mx/guias/')) {
    const slug = path.slice('/es-mx/guias/'.length);
    return `/guides/${englishSlug(guideSlugsEs, slug)}${query}`;
  }
  if (path.startsWith('/es-mx/usuarios/')) {
    return `/users/${path.slice('/es-mx/usuarios/'.length)}${query}`;
  }

  return '/';
}

export function localizedPath(pathname: string, locale: SiteLocale) {
  return locale === 'es-MX' ? toSpanishPath(pathname) : toEnglishPath(pathname);
}

export const navigationLabels = {
  en: {
    home: 'Home', generations: 'Generations', search: 'Search', pdfs: 'PDFs', guides: 'DIY Guides',
    myVw: 'My VW', feedback: 'Feedback', admin: 'Admin', submitGuide: 'Submit Guide', profile: 'Profile',
    upload: 'Upload PDF', saved: 'Saved Items', signOut: 'Sign Out', signIn: 'Sign In', signUp: 'Sign Up',
  },
  'es-MX': {
    home: 'Inicio', generations: 'Generaciones', search: 'Buscar', pdfs: 'PDFs', guides: 'Guías',
    myVw: 'Mi VW', feedback: 'Comentarios', admin: 'Admin', submitGuide: 'Enviar guía', profile: 'Perfil',
    upload: 'Subir PDF', saved: 'Guardados', signOut: 'Cerrar sesión', signIn: 'Iniciar sesión', signUp: 'Crear cuenta',
  },
} as const;

export const systemNamesEs: Record<string, string> = {
  engine: 'Motor',
  suspension: 'Suspensión',
  brakes: 'Frenos',
  electrical: 'Sistema eléctrico',
  transmission: 'Transmisión',
  body: 'Carrocería e interior',
  cooling: 'Sistema de enfriamiento',
};

export const difficultyNamesEs: Record<string, string> = {
  easy: 'Fácil',
  moderate: 'Intermedia',
  hard: 'Difícil',
};

export function formatTimeEstimateEs(value: string) {
  return value.replace(/\bhours?\b/gi, 'horas').replace(/(\d)\s*-\s*(\d)/g, '$1 a $2');
}

export const generationDescriptionsEs: Record<string, string> = {
  mk1: 'La primera generación del Golf moderno y de los hatchbacks deportivos de Volkswagen. Su motor transversal definió décadas de modelos VW.',
  mk2: 'La segunda generación consolidó el legado del GTI con mayor refinamiento, mejor desempeño y el estilo emblemático de los años ochenta.',
  mk3: 'La tercera generación adoptó líneas más redondeadas e introdujo el motor VR6 en la familia Golf.',
  mk4: 'La refinada cuarta generación incorporó el reconocido motor 1.8T y se convirtió en una plataforma muy popular para modificaciones.',
  mk5: 'La quinta generación recuperó el desempeño del GTI e incorporó motores 2.0T FSI y posteriormente TSI.',
  mk6: 'La sexta generación combinó un diseño más conservador con mejoras de calidad, seguridad y desempeño.',
  mk7: 'La plataforma MQB trajo avances importantes en tecnología, seguridad, eficiencia y desempeño.',
  mk8: 'La octava generación incorporó una cabina digital, sistemas modernos de asistencia y opciones electrificadas.',
  type1: 'El legendario Sedán Volkswagen enfriado por aire, conocido en México como Vocho y producido durante varias décadas.',
  type2: 'La icónica Combi Volkswagen, desde las primeras versiones con parabrisas dividido hasta transportadores modernos.',
  aircooled: 'Modelos Volkswagen enfriados por aire, incluidos los Tipo 1, Tipo 2, Tipo 3 y los primeros Tipo 4.',
  watercooled: 'Modelos Volkswagen enfriados por agua, desde las primeras plataformas modernas hasta la actualidad.',
};

function splitPath(pathname: string) {
  const queryIndex = pathname.indexOf('?');
  if (queryIndex === -1) return { path: pathname || '/', query: '' };

  return {
    path: pathname.slice(0, queryIndex) || '/',
    query: pathname.slice(queryIndex),
  };
}

export function englishGenerationSlug(slug: string) { return englishSlug(generationSlugsEs, slug); }
export function englishSystemSlug(slug: string) { return englishSlug(systemSlugsEs, slug); }
export function englishGuideSlug(slug: string) { return englishSlug(guideSlugsEs, slug); }

function englishSlug(slugs: Record<string, string>, localizedSlug: string) {
  return Object.entries(slugs).find(([, spanish]) => spanish === localizedSlug)?.[0] || localizedSlug;
}

function localizeQuery(query: string, locale: SiteLocale) {
  if (!query) return '';
  const params = new URLSearchParams(query.slice(1));
  const generation = params.get('gen');
  if (generation) {
    params.set('gen', locale === 'es-MX' ? generationSlugsEs[generation] || generation : englishGenerationSlug(generation));
  }
  const value = params.toString();
  return value ? `?${value}` : '';
}
