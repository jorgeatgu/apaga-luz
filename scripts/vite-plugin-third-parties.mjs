// Plugin de Vite para lo que todas las páginas cargan igual, en build y en dev. Inyecta en cada
// HTML de entrada:
//   - el módulo de terceros (stub de gtag y política de carga de gtag), antes que la medición de
//     campo, que envía a través de ese stub;
//   - la etiqueta `<script defer>` de AdSense y su preconnect, salvo en ADSENSE_EXCLUDED;
//   - la entrada de la medición de campo.
// Los HTML no llevan copias propias: si una entrada trae su bloque de GA4 o de AdSense, el plugin
// falla y el build no sale.

export const FIELD_METRICS_ENTRY = '/source/javascript/field-metrics-entry.js';
export const THIRD_PARTIES_ENTRY = '/source/javascript/third-parties-entry.js';

// Entradas sin anuncios, con la ruta de vite.config.js
export const ADSENSE_EXCLUDED = ['politica-de-privacidad/index.html'];

const ENTRY_TAG = `<script type="module" src="${FIELD_METRICS_ENTRY}"></script>`;
const ADSENSE_TAGS = [
  '<link rel="preconnect" href="https://pagead2.googlesyndication.com" crossorigin>',
  '<script defer src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8990231994528437" crossorigin="anonymous"></script>'
];
const GTAG_TAGS = [
  '<link rel="preconnect" href="https://www.googletagmanager.com">',
  `<script type="module" src="${THIRD_PARTIES_ENTRY}"></script>`
];

// Etiquetas que solo puede poner el plugin. Se buscan etiquetas, no texto suelto, para que una
// página pueda nombrar Google Analytics o AdSense en su contenido.
const COPY_PATTERNS = [
  /<link[^>]*googletagmanager\.com[^>]*>/g,
  /<script[^>]*googletagmanager\.com[^>]*>/g,
  /<script\b[^>]*>(?:(?!<\/script>)[\s\S])*googletagmanager\.com\/gtag\/js[\s\S]*?<\/script>/g,
  /<link[^>]*pagead2\.googlesyndication\.com[^>]*>/g,
  /<script[^>]*adsbygoogle\.js[^>]*>/g
];

export function findThirdPartyCopies(html) {
  return COPY_PATTERNS.flatMap(pattern => html.match(pattern) ?? []);
}

export function injectFieldMetrics(html) {
  if (html.includes(FIELD_METRICS_ENTRY)) return html;
  return html.replace('</head>', `${ENTRY_TAG}\n</head>`);
}

function isExcludedFromAdsense(filename = '') {
  const path = filename.replaceAll('\\', '/');
  return ADSENSE_EXCLUDED.some(entry => path.endsWith(`/${entry}`));
}

export function injectThirdParties(html, filename) {
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
