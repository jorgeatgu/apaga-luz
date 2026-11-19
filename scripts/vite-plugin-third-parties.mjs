// Plugin de Vite para lo que todas las páginas cargan igual, en build y en dev. Inyecta en cada
// HTML de entrada:
//   - el módulo de terceros (stub de gtag y la parte de gtag de la política de carga de
//     terceros), antes que la medición de campo, que envía a través de ese stub;
//   - la parte de AdSense de esa política: su `<script defer>` y su preconnect, salvo en
//     ADSENSE_EXCLUDED;
//   - la entrada de la medición de campo.
// Vite saca los `<script type="module">` al final del <head>, así que el módulo de terceros se
// ejecuta después de AdSense, al terminar el parseo, y no mientras se parsea como el antiguo
// bloque en línea. Si la medición de carga enseña que eso mueve gtag, el stub pasa a ir en línea.
// Los HTML no llevan copias propias: si una entrada trae su bloque de GA4 o de AdSense, el plugin
// falla y el build no sale.

export const FIELD_METRICS_ENTRY = '/source/javascript/field-metrics-entry.js';
export const THIRD_PARTIES_ENTRY = '/source/javascript/third-parties-entry.js';

// Entradas sin anuncios, con la ruta de vite.config.js
const ADSENSE_EXCLUDED = ['politica-de-privacidad/index.html'];

const FIELD_METRICS_TAG = `<script type="module" src="${FIELD_METRICS_ENTRY}"></script>`;
const ADSENSE_TAGS = [
  '<link rel="preconnect" href="https://pagead2.googlesyndication.com" crossorigin>',
  '<script defer src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8990231994528437" crossorigin="anonymous"></script>'
];
const GTAG_TAGS = [
  '<link rel="preconnect" href="https://www.googletagmanager.com">',
  `<script type="module" src="${THIRD_PARTIES_ENTRY}"></script>`
];

// Lo que solo puede poner el plugin: cualquier `<script>` (por sus atributos o por su código) o
// `<link>` que lleve a gtag o a AdSense. Se buscan etiquetas, no texto suelto, para que una página
// pueda nombrar Google Analytics o AdSense en su contenido.
const THIRD_PARTY_HOSTS =
  /googletagmanager|adsbygoogle\.js|pagead2\.googlesyndication/;
const SCRIPTS_AND_LINKS = /<script\b[^>]*>[\s\S]*?<\/script>|<link\b[^>]*>/g;

export function findThirdPartyCopies(html) {
  return (html.match(SCRIPTS_AND_LINKS) ?? []).filter(tag =>
    THIRD_PARTY_HOSTS.test(tag)
  );
}

export function injectFieldMetrics(html) {
  if (html.includes(FIELD_METRICS_ENTRY)) return html;
  return html.replace('</head>', `${FIELD_METRICS_TAG}\n</head>`);
}

function isExcludedFromAdsense(filename) {
  const path = filename.replaceAll('\\', '/');
  return ADSENSE_EXCLUDED.some(entry => path.endsWith(`/${entry}`));
}

function injectThirdParties(html, filename) {
  const copies = findThirdPartyCopies(html);
  if (copies.length > 0) {
    throw new Error(
      `${filename} trae sus propias etiquetas de terceros; las inyecta el plugin third-parties:\n${copies.join(
        '\n'
      )}`
    );
  }
  const tags = isExcludedFromAdsense(filename)
    ? GTAG_TAGS
    : [...ADSENSE_TAGS, ...GTAG_TAGS];
  return html.replace('</head>', `${tags.join('\n')}\n</head>`);
}

export function thirdPartiesPlugin() {
  return {
    name: 'third-parties',
    // `pre`: Vite todavía no ha procesado el HTML, así que empaqueta las entradas inyectadas.
    transformIndexHtml: {
      order: 'pre',
      handler: (html, { filename }) =>
        injectFieldMetrics(injectThirdParties(html, filename))
    }
  };
}
