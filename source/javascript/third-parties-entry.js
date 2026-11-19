// Entrada del módulo de terceros. La inyecta en todas las páginas el plugin `third-parties`
// (scripts/vite-plugin-third-parties.mjs) antes que la de la medición de campo, para que el stub
// de `gtag` exista cuando esta envíe.
import { startThirdParties } from './third-parties.js';

startThirdParties({
  window,
  document,
  setTimeout: window.setTimeout.bind(window)
});
