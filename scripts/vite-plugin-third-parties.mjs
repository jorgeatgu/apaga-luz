// Plugin de Vite para lo que todas las páginas cargan igual. Hoy inyecta la entrada de la
// medición de campo en cada HTML de entrada, en build y en dev. En la fase 4 del Sprint 06
// se quedará también con el módulo de terceros (GA4 y AdSense).

export const FIELD_METRICS_ENTRY = '/source/javascript/field-metrics-entry.js';

const ENTRY_TAG = `<script type="module" src="${FIELD_METRICS_ENTRY}"></script>`;

export function injectFieldMetrics(html) {
  if (html.includes(FIELD_METRICS_ENTRY)) return html;
  return html.replace('</head>', `${ENTRY_TAG}\n</head>`);
}

export function thirdPartiesPlugin() {
  return {
    name: 'third-parties',
    // `pre`: Vite todavía no ha procesado el HTML, así que empaqueta la entrada inyectada.
    transformIndexHtml: {
      order: 'pre',
      handler: injectFieldMetrics
    }
  };
}
