// Entrada de la medición de campo. La inyecta en todas las páginas el plugin `third-parties`
// (scripts/vite-plugin-third-parties.mjs): conecta web-vitals con GA4 a través del stub de
// `gtag` que cada HTML define en línea antes de cargar los módulos.
import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals/attribution';

import { isDebug, startFieldMetrics } from './field-metrics.js';

// Terser (`drop_console`) borra los accesos a `console`: con ?debug=true hace falta verlos.
const log = window['con' + 'sole'].log;

startFieldMetrics({
  onCLS,
  onFCP,
  onINP,
  onLCP,
  onTTFB,
  location: window.location,
  send: isDebug(window.location)
    ? (name, params) => log(`[medición de campo] ${name}`, params)
    : (name, params) => window.gtag('event', name, params)
});
