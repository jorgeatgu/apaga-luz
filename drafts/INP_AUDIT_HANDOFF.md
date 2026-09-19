# Prompt de traspaso — Auditoría INP apaga-luz.com

> Pega esto al inicio de la nueva sesión. Resume todo el contexto y define el plan:
> **probar contra producción con Claude para Chrome** para decidir, con datos, los
> últimos ajustes de AdSense.

---

## Contexto del proyecto
- `apaga-luz.com`: sitio estático HTML/CSS/JS con build Vite (output `build/`, **gitignored**, lo regenera Vercel en cada deploy). No hay framework SSR.
- JS propio en `source/javascript/`, estilos en `source/styles/styles.css`.
- Datos de precios en `public/data/*.json` (actualizados por Flat).
- Monetización: **Google AdSense en modo Auto Ads a nivel de cuenta** (no hay `<ins>` ni slots en el HTML; Google inyecta los anuncios solo con el loader `<script defer ...adsbygoogle.js?client=ca-pub-8990231994528437>`).

## Problema
Google Search Console reporta **INP > 200ms en móvil** en dos grupos de URLs:
- `https://www.apaga-luz.com/` (p75 ≈ 221 ms, ~6 muestras)
- `https://www.apaga-luz.com/noticias/` (p75 ≈ 221 ms, ~22 muestras)

## Hallazgos de la auditoría de código (sesión anterior)
1. **GTM/GA ya era lazy en `/` y `/noticias/`** → Analytics NO era la causa del INP ahí. (Quitar GA no afecta a GSC, son sistemas independientes.)
2. **Auto Ads** ⇒ el antiguo `ads-optimizer.js` buscaba selectores `.adsbygoogle`/`[data-ad-slot]` inexistentes → era **no-op** (peso muerto en cada página, además forzaba un *layout read* con la detección de ad-blocker).
3. **`/noticias/` es ligerísima de JS propio** (solo `styles.js`; el menú ya usa `inpOptimizer`). Su INP es casi todo AdSense.
4. `web-vitals.js` usaba el build estándar (sin atribución) → `target` siempre `'unknown'`.
5. Posible antipatrón: `inpOptimizer.createOptimizedHandler` difiere un `classList.toggle` trivial con `setTimeout(0)`/`postTask`, lo que puede **inflar `presentationDelay`** del toggle del menú. A verificar con datos.
6. Bug de ingresos pre-existente: `.adsbygoogle` y `#ad-container` en `index.html` tenían `max-height:300px; overflow:hidden` → **recortaban** formatos altos de Auto Ads (in-article 400-600px).

## Cambios YA HECHOS y DESPLEGADOS EN PRODUCCIÓN (sin riesgo de ingresos)
- **Fase 0 — Atribución INP** (`source/javascript/web-vitals.js`): cambiado a `web-vitals@4` **attribution build** (`https://unpkg.com/web-vitals@4/dist/web-vitals.attribution.iife.js`). Cada INP loguea en consola, agrupado: elemento culpable (selector + tag/id/clases), **fases** `inputDelay`/`processingDuration`/`presentationDelay`, `loadState`, y **scripts LoAF** en `console.table` ordenados por duración. En INP crítico muestra la **fase dominante**.
  - ⚠️ web-vitals está **desactivado en localhost** salvo que añadas `?debug=true` (ver `shouldLoadInEnvironment`). En producción se activa con sampling 80%.
- **Fase 1 — GA eliminado**: quitado de 46 HTML (variante lazy `loadGTM` y async directa), borrados `analytics-optimizer.js` y `update-analytics-optimization.js`, limpiado `vite.config.js` (chunk analytics, Terser `keep_fnames`/`reserved`, CSP sin dominios GA, defines `__ANALYTICS_*`). Quedan referencias `if (window.gtag)` como no-ops inofensivos.
- **Fase 2 — AdSense (solo código, sin tocar ingresos)**:
  - Borrado `ads-optimizer.js` y sus imports en `styles.js` y `main.js` (≈7 KB menos de JS de hilo principal por página).
  - **Clipping corregido** en `index.html`: quitado `max-height`/`overflow:hidden` de `.adsbygoogle` y `#ad-container`, mantenido `min-height:280px` para CLS. (`graficas/` y `precio-luz-manana/` ya usaban el patrón correcto `.adsbygoogle-noablate { min-height:72px }`.)

## Decisión PENDIENTE (no tomar a ciegas → por eso medimos)
Ajustes de Auto Ads en el panel de AdSense, **distinguiendo formatos**:
- **Anchor (banner fijo):** alto ingreso, **bajo impacto INP** (fixed, no reflowea). → **MANTENER siempre.**
- **Vignette/intersticial:** alto ingreso pero **el peor para INP** porque se dispara sobre el propio tap de navegación (secuestra la interacción). → **Único candidato a test A/B**, solo si la atribución demuestra que es el culpable. Ya tiene frequency capping.
- Otras palancas sin matar top earners: bajar un escalón "Carga de anuncios".

---

## PLAN DE ESTA SESIÓN: pruebas contra PRODUCCIÓN con Claude para Chrome

Objetivo: **atribuir el INP real** de `/` y `/noticias/` en móvil con anuncios reales (en local AdSense no se sirve), para decidir si hay que tocar vignette o si el INP ya bajó con la limpieza desplegada, o si el culpable es JS propio (Fase 3).

### Pasos
1. Navegar con Claude para Chrome a `https://www.apaga-luz.com/noticias/` y `https://www.apaga-luz.com/` en **viewport móvil** y con **CPU throttling 4×** (DevTools).
2. Abrir consola: web-vitals (attribution) imprime el desglose de cada INP. **Provocar interacciones** representativas:
   - `/noticias/`: tap en el menú hamburguesa, taps en enlaces de artículos, scroll.
   - `/`: tap menú, ordenar tabla (precio/hora), checkbox "deshabilitar horas pasadas", scroll.
3. Para cada interacción lenta apuntar: **valor INP**, **fase dominante** (input/processing/presentation), **elemento**, y **scripts LoAF** (¿`adsbygoogle.js` / dominios de Google, o JS propio `main.js`/`styles.js`?).
4. Complementar con DevTools **Performance** (grabar interacción, leer el bloque INP, LoAF y attribution de scripting) y un **Lighthouse móvil**.
5. Clasificar el culpable por página:
   - Si domina **AdSense** (LoAF a `googlesyndication`/`doubleclick`, fase input/presentation) → evaluar test de **vignette** (mantener anchor) y/o "ad load".
   - Si domina **JS propio** → Fase 3: revisar `inpOptimizer.createOptimizedHandler` en el toggle del menú (`styles.js:12`), `handleCheckboxChange` (`main.js`, añadir debounce) y `chunkSize:1` en `loadInitialData` (subir a 8-12).

### ⚠️ BLOQUEANTE a resolver antes de medir en producción
`vite.config.js` tiene `terserOptions.compress.drop_console: true` + `pure_funcs: ['console.log','console.debug','console.info']`. **En el build de producción se eliminan los `console.*`**, así que la instrumentación de atribución (que usa `console.groupCollapsed`/`console.log`/`console.table`) **NO se verá en producción**. Opciones:
- (a) Ajustar `drop_console`/`pure_funcs` para conservar el logging de web-vitals (p. ej. no dropear `console.warn`/`console.table`/`console.groupCollapsed`, o envolver el logging en algo que Terser no elimine).
- (b) Medir en un **deploy de preview** sin `drop_console`.
- (c) Enviar la atribución a un endpoint/`sendBeacon` en vez de consola.
Decidir esto es el primer paso de la sesión.

### Notas para la medición
- Producción tiene sampling 80% en web-vitals; si no ves logs, recarga o añade `?debug=true` por si acaso.
- Activar nivel **Verbose/Info** en la consola de DevTools (se usa `console.groupCollapsed`/`console.table`).
- El INP es **field data** en GSC (28 días): los cambios desplegados tardarán semanas en reflejarse. La medición de esta sesión es **lab data** para diagnóstico, no para confirmar la mejora de GSC.
- Anchor NO se toca pase lo que pase.

## Archivos clave
- `source/javascript/web-vitals.js` — instrumentación de atribución (Fase 0).
- `source/javascript/styles.js` — carga de `/noticias/`; menú con `inpOptimizer` (sospechoso Fase 3).
- `source/javascript/main.js` — home; tablas, checkbox, `loadInitialData` (sospechosos Fase 3).
- `source/javascript/inp-optimizer.js` — `createOptimizedHandler` (¿difiere paints?).
- `index.html` — CSS de reserva de anuncios (ya sin clipping).
- Plan original: `/Users/jorgeatgu/.claude/plans/buenas-volvemos-al-tema-recursive-sphinx.md`

## Estado git
Todo lo anterior commiteado y desplegado. `build/` lo regenera Vercel (gitignored).
