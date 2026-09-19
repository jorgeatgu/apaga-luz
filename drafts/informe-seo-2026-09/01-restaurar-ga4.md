# Acción 1 — Restaurar GA4 con carga diferida

**Problema**: el commit `674f83d1` (2026-05-26) eliminó `gtag/js?id=G-E9V8ZPM3P0` de index.html, precio-luz-manana, graficas, horas-baratas-luz, compensacion-del-gas y todos los `noticias/*`. GA4 no registra sesiones desde mediados de junio. `source/javascript/web-vitals.js` e `inp-optimizer.js` siguen llamando a `window.gtag` (no-op ahora).

**Objetivo**: volver a medir sin penalizar INP (causa raíz del INP era adsbygoogle, no GA: ver memoria `inp-root-cause`).

**Cómo**: un único snippet en todas las páginas que cargue gtag tras `window.load` + `requestIdleCallback` (fallback setTimeout 2s), con `gtag('config', 'G-E9V8ZPM3P0', { send_page_view: true })`. Mismo patrón que ya existía en la versión "lazy" que el diff de `git show 674f83d1` muestra (líneas con `script.src = 'https://www.googletagmanager.com/gtag/js?id=G-E9V8ZPM3P0'`).

**PROMPT**
```
Restaura Google Analytics 4 (ID G-E9V8ZPM3P0) en todas las páginas HTML del proyecto (index.html, precio-luz-manana, graficas, horas-baratas-luz, compensacion-del-gas, preguntas, tipos-tarifas-electricas, noticias/index.html y noticias/*/index.html). Usa `git show 674f83d1` para ver la variante lazy que existía y reimplántala como un único bloque: carga gtag.js tras el evento load y requestIdleCallback (fallback setTimeout 2000), preconnect a googletagmanager.com. No toques adsbygoogle. Verifica con grep que todas las páginas lo incluyen exactamente una vez y comprueba en local que window.gtag existe tras la carga. Después haz build y crea un commit.
```

**Verificación**: GA4 tiempo real muestra sesiones a los 5 minutos del deploy; anotar la fecha en este fichero como baseline.
