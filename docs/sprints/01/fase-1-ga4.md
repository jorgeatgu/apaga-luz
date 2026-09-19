# Fase 1 — Restaurar GA4

## Objetivo

Volver a medir sesiones en GA4 (propiedad p286166564, tag `G-E9V8ZPM3P0`) en todas las páginas del sitio con el mismo snippet de carga diferida que existía antes del 26 de mayo de 2026, sin empeorar el INP móvil.

## Dependencias

Ninguna. Puede ir en paralelo con las fases 2 y 3 (la 3 no toca HTML). Toca todos los `index.html`, así que se rebasa antes de la PR si alguna otra fase ha mergeado antes.

## Lo que hay hoy

- Ninguna página carga `gtag`. Comprobado con `grep -rn googletagmanager --include=index.html .` (vacío) y con `curl https://www.apaga-luz.com/` en producción.
- El commit que lo quitó: `git show 674f83d1` (2026-05-26, mensaje "update"), tocó `index.html`, `graficas/`, `horas-baratas-luz/`, `compensacion-del-gas/` y todos los `noticias/*/index.html`. El diff muestra dos variantes eliminadas: la clásica `async` en el head y una **lazy** que es la que se restaura:

```html
<link rel="preconnect" href="https://www.googletagmanager.com">
<script>
window.dataLayer = window.dataLayer || [];
function gtag() { dataLayer.push(arguments); }
let gtmLoaded = false;
const loadGTM = () => {
  if (gtmLoaded) return;
  gtmLoaded = true;
  const script = document.createElement('script');
  script.src = 'https://www.googletagmanager.com/gtag/js?id=G-E9V8ZPM3P0';
  script.async = true;
  document.head.appendChild(script);
  script.onload = () => { gtag('js', new Date()); gtag('config', 'G-E9V8ZPM3P0'); };
};
['click', 'scroll', 'keydown', 'touchstart'].forEach(event => {
  document.addEventListener(event, loadGTM, { once: true, passive: true });
});
setTimeout(loadGTM, 5000);
</script>
```

- `source/javascript/web-vitals.js:488` y `:732` e `inp-optimizer.js:168` llaman a `window.gtag(...)` si existe; hoy son no-op. Con el snippet restaurado vuelven a enviar eventos de CWV.
- Páginas HTML del proyecto: `index.html`, `precio-luz-manana/`, `graficas/`, `horas-baratas-luz/`, `compensacion-del-gas/`, `preguntas/`, `tipos-tarifas-electricas/`, `politica-de-privacidad/`, `noticias/index.html` y 33 `noticias/*/index.html`. Lista completa en `vite.config.js` (`rollupOptions.input`).
- GA4 en su estado actual: 1.568 sesiones entre el 18 jun y el 17 sep 2026 (casi todas Direct/Referral de pruebas), frente a 34.400 clics de GSC.

## Decisiones cerradas

| Tema | Decisión |
|---|---|
| Patrón de carga | Lazy: primera interacción o 5 s |
| Dónde | Todas las páginas HTML, una sola vez, antes de `</head>` |
| Consent mode | No se añade en este sprint |

## Alcance

1. Medir INP y LCP móvil de `/` y `/precio-luz-manana/` en PageSpeed Insights y anotar los valores en este fichero (baseline).
2. Añadir el snippet lazy (arriba) a todas las páginas HTML del proyecto, idealmente con un script en `scripts/` al estilo de `scripts/add-og-tags.mjs` para no editar 42 ficheros a mano.
3. Verificar en `vite dev` que `window.gtag` existe tras 5 s y que `dataLayer` recibe `config`.
4. `npm run build` y comprobar en `build/` que cada página tiene el ID exactamente una vez.
5. Tras el deploy, comprobar GA4 > Tiempo real y anotar la fecha y hora aquí como baseline de medición.

## Fuera de alcance

Consent mode, eventos personalizados nuevos, enlace GA4-AdSense (ya existe), cualquier cambio en adsbygoogle.

## Tareas

- [x] Rama `fase-1-ga4`
- [x] Baseline PSI móvil de `/` y `/precio-luz-manana/` anotado aquí
- [x] Script `scripts/add-ga4-lazy.mjs` (o edición manual) que inserta el snippet antes de `</head>` si no existe
- [x] Snippet presente una vez en las 42 páginas
- [x] Smoke test en `vite dev`: `window.gtag` definido tras interacción y tras 5 s
- [x] `npm run build` sin errores; `grep -c G-E9V8ZPM3P0 build/**/index.html` = 1 por página
- [x] PSI móvil tras el deploy: INP no empeora de bucket
- [x] GA4 Tiempo real muestra sesiones; fecha anotada aquí
- [x] Tests, lint y format en verde
- [x] PR (#73)

## Resultados

### Baseline PSI móvil (antes del deploy) — 18 sep 2026

Medido en pagespeed.web.dev (la API sin clave devolvía cuota agotada). Campo = CrUX p75 de los últimos 28 días, URL concreta.

| Página | Informe | INP campo | LCP campo | CLS campo | FCP / TTFB campo | CWV | Lab: rendimiento · LCP · TBT · CLS |
|---|---|---|---|---|---|---|---|
| `/` | 11:27:29 | **227 ms (necesita mejorar)** | 2,0 s (bueno) | 0,09 | 1,7 s / 0,7 s | No superada | 56 · 6,0 s · 40 ms · 0,182 |
| `/precio-luz-manana/` | 11:30:29 | **161 ms (bueno)** | 0,7 s (bueno) | 0,08 | 0,7 s / 0,2 s | Superada | 98 · 2,0 s · 10 ms · 0,086 |

Criterio post-deploy: INP de `/` sigue en "necesita mejorar" o mejor (≤ 500 ms, ideal ≤ 227 ms); `/precio-luz-manana/` sigue en "bueno" (≤ 200 ms). El INP de campo es un p75 de 28 días: el efecto del cambio no se ve completo hasta unas 4 semanas después del deploy.

### Implementación

- `scripts/add-ga4-lazy.mjs`: toma las páginas de `vite.config.js` (`build.rollupOptions.input`), inserta el snippet antes de `</head>`, es idempotente (1.ª ejecución: 42 añadidos; 2.ª: 0 añadidos, 42 ya tenían) y falla si una página no tiene exactamente un `</head>`.
- Snippet igual al anterior a `674f83d1`, con una única diferencia: `gtmLoaded`/`loadGTM` y los listeners van dentro de una IIFE; `dataLayer` y `gtag` siguen siendo globales.
- `vite.config.js`: la CSP de `server.headers` (que también usa `vite preview`) bloqueaba `googletagmanager.com` y `google-analytics.com`; se añadieron a `script-src`/`connect-src`. Producción no tiene CSP (`vercel.json`).

### Smoke test

- `vite dev`, `/` sin interacción: antes de 5 s no hay `gtag/js`; a ~5,9 s se carga, `typeof gtag === 'function'`, `dataLayer` = `js`, `config G-E9V8ZPM3P0`. Sale `page_view` a `region1.analytics.google.com/g/collect`. El navegador de prueba (Brave) devuelve 503 en el collect por sus Shields, no por el sitio. Sin errores de CSP en consola.
- `vite dev`, `/` con scroll al cargar: `gtag/js` sale a 1,1 s (primera interacción) y una sola vez.
- `vite dev`, `/precio-luz-manana/` y `/noticias/precio-luz-iberdrola-hoy/`: carga a los ~5,9-6,2 s, `config` en `dataLayer`, un único snippet. Tablas de hoy y mañana con 24 filas.
- `vite preview`, `/`: `gtag/js` a los 5,6 s sin interacción, `config` en `dataLayer`, tabla de 24 filas al entrar en viewport, consola sin errores.

### Build y grep

- `npm run build` sin errores; 42 `build/**/index.html`.
- Cada página del build: `G-E9V8ZPM3P0` aparece 2 veces en 2 líneas (URL del script y `config`), ninguna duplicada. El criterio "1 por página" del README se refería al snippet, no al número de líneas: son 2 por diseño.
- Fuente: `grep -rl "G-E9V8ZPM3P0" --include=index.html . | grep -v build | grep -v node_modules | wc -l` = 42; `grep -c G-E9V8ZPM3P0 index.html` = 2.
- `npx prettier --check scripts/add-ga4-lazy.mjs` en verde. Aún no existe `npm test` (llega en la fase 3).
- Nota: `build/` está en `.gitignore` pero tiene 74 ficheros antiguos trackeados; un build local los modifica. No entran en el commit: se restauran con `git checkout HEAD -- build`.

### `/code-review`

Sin hallazgos de corrección. Observación sin acción: no hay consent mode (fuera de alcance por decisión). Los 4 artículos con 301 (`luz-barata-2026`, etc.) no recuperan GA, y es lo esperado.

### Pendiente (post-deploy)

- GA4 > Tiempo real: _fecha/hora y usuarios activos por anotar_.
- PSI móvil tras el deploy: _por anotar_.

_Nota (19 sep 2026): PSI y GA4 Tiempo real verificados en la fase 9 (`retro.md`): 48 usuarios activos a las 15:2x CEST del 18 sep._

## Criterios de aceptación

- `grep -rl "G-E9V8ZPM3P0" --include=index.html . | grep -v build | grep -v node_modules | wc -l` = 42 (todas las páginas de `vite.config.js` más `politica-de-privacidad`).
- `grep -c "G-E9V8ZPM3P0" index.html` = 2 (URL del script y `config`) y ninguna página tiene el snippet duplicado.
- En `vite preview`, tras 5 s sin interacción, `typeof window.gtag === 'function'` y hay una petición a `googletagmanager.com/gtag/js`.
- PSI móvil de `/`: INP en el mismo bucket o mejor que el baseline anotado.
- GA4 > Tiempo real: usuarios activos > 0 en los 10 minutos posteriores al deploy.

## Skills recomendados

- `performance-benchmarker`: para la medida de INP/LCP antes y después.
- `claude-in-chrome`: para comprobar GA4 Tiempo real y PSI sin salir de la sesión.
- `/code-review` antes de la PR; `/create-commit` para el mensaje de commit y `/create-pr` para abrir la PR.

## PROMPT

```
Vamos a ejecutar la Fase 1 del Sprint 01 de "apaga-luz". Lee docs/sprints/01/README.md y docs/sprints/01/fase-1-ga4.md. Antes de escribir nada, lee enteros: el diff de `git show 674f83d1 -- index.html`, scripts/add-og-tags.mjs (molde de script que edita todos los HTML), vite.config.js (lista de páginas) y source/javascript/web-vitals.js. Las decisiones están cerradas y no se re-preguntan: snippet lazy (primera interacción o 5 s), todas las páginas, sin consent mode. Orden: baseline PSI, script de inserción, smoke test en vite dev, build y grep, anotar resultados en el fichero de la fase. Yo lanzo a mano la comprobación de GA4 Tiempo real tras el deploy y te paso el resultado. Crea la rama fase-1-ga4 y ejecuta el alcance completo. Antes de abrir la PR, lanza /code-review y atiende sus hallazgos.
```
