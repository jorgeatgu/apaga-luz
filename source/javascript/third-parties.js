// Módulo de terceros: carga gtag de GA4 en todas las páginas. Lo inyecta el plugin
// `third-parties` (scripts/vite-plugin-third-parties.mjs) a través de third-parties-entry.js, y
// el mismo plugin pone la etiqueta `<script defer>` de AdSense.
//
// Política de carga de terceros: gtag al primer gesto o a los 5 s, lo que llegue antes, y
// AdSense con `defer`.

const GA_ID = 'G-E9V8ZPM3P0';
const GTAG_SRC = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
const FIRST_GESTURES = ['click', 'scroll', 'keydown', 'touchstart'];
const GTAG_FALLBACK_MS = 5000;

export function startThirdParties({ window, document, setTimeout }) {
  // Stub de gtag: la medición de campo y gtag.js leen `dataLayer`; gtag.js espera objetos
  // `arguments`, no arrays.
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };

  let gtagLoaded = false;
  const loadGtag = () => {
    if (gtagLoaded) return;
    gtagLoaded = true;
    const script = document.createElement('script');
    script.src = GTAG_SRC;
    script.async = true;
    document.head.appendChild(script);
    script.onload = () => {
      window.gtag('js', new Date());
      window.gtag('config', GA_ID);
    };
  };

  FIRST_GESTURES.forEach(type => {
    document.addEventListener(type, loadGtag, { once: true, passive: true });
  });
  setTimeout(loadGtag, GTAG_FALLBACK_MS);
}
