# Fase 3 — Plugin de Vite de datos del día + tests

## Objetivo

Crear un plugin de Vite que, durante `vite build`, sustituya placeholders en el HTML con la fecha y los datos de precio de hoy y de mañana, para que `<title>`, `<h1>` y los Quick Answer de las páginas-herramienta y de los artículos "hoy" lleven siempre el día de la semana y el dato del día en el HTML estático. Es la pieza sobre la que se apoyan las fases 4, 5 y 6.

## Dependencias

Ninguna. Paralela a las fases 1 y 2. Bloquea 4, 5 y 6.

## Lo que hay hoy

- `vite.config.js`: `defineConfig` con `build.outDir = 'build'`, `rollupOptions.input` con 42 páginas y `output.assetFileNames`. No hay plugins.
- Deploy: `.github/workflows/deploy.yml` corre `vercel --prod` en cada push a `public/**`. Flat hace 3-4 commits al día en `public/data/` (`flat.yml`, `flat-tomorrow.yml` a las 19:22 UTC, `omie.yml` a las 12:15 UTC, `flat-canary.yml`). Cada uno rebuild + deploy, así que el HTML generado se refresca solo.
- Datos:
  - `public/data/today_price.json`: array de `{ day: "18/09/2026", hour: 0, price: 0.202, zone: "valle" }`, 24 filas, €/kWh.
  - `public/data/tomorrow_price.json`: mismo formato, con el día de mañana cuando ESIOS ha publicado (20:15 hora peninsular). Antes de eso contiene el día anterior.
  - `public/data/omie_data.json`: generado por `omie_dataset.js` a partir de `omie_prices.json` (OMIE, ~13:30). Campos `day`, `month`, `hour`, `price` (ver `source/javascript/tomorrow.js:46-47`).
- Lógica de referencia para elegir fuente: `source/javascript/tomorrow.js:40-75`. Elige ESIOS a partir de las 20:20 y OMIE a partir de las 13:10 **por hora del navegador** y luego comprueba `check_the_day_in_data` (día y mes del JSON = mañana). En build no hay hora de usuario: el plugin debe decidir **solo por el dato** (qué JSON contiene el día de mañana), en zona horaria `Europe/Madrid`.
- Scripts existentes que editan HTML en lote como molde de estilo: `scripts/add-og-tags.mjs`, `scripts/optimize-articles-cwv.mjs` (ESM, `fs` + regex).
- `package.json`: scripts `dev`, `build`, `serve`, `lint-css`, `lint-staged`. No hay `test`. `lint-staged` pasa `prettier --write` a `source/javascript/*.js`.

## Decisiones cerradas

| Tema | Decisión |
|---|---|
| Momento | Build (`transformIndexHtml`), no runtime |
| Selección de fuente para mañana | Por dato: si `tomorrow_price.json` tiene el día de mañana → estado C (ESIOS); si no y `omie_data.json` lo tiene → estado B (OMIE); si no → estado A (sin datos) |
| Zona horaria | `Europe/Madrid` vía `Intl.DateTimeFormat`, nunca `new Date()` local del runner |
| Fallback | Todo placeholder lleva texto por defecto en el HTML fuente; si falta un dato, se deja el fallback y el plugin avisa por consola sin romper el build |
| Copy estado B | "precio de la luz" genérico, sin "mayorista"; se añade "El precio hora a hora se publica a las 20:15" |
| Tests | `node --test` en `scripts/__tests__/` o `tests/`, script `npm test` |

## Alcance

1. `scripts/vite-plugin-daily-data.mjs` (nombre orientativo) que exporta `dailyDataPlugin({ dataDir })` con hook `transformIndexHtml`. Expone también las funciones puras para testear: `computeDailyContext({ today, tomorrow, omie, now })` y `applyPlaceholders(html, ctx)`.
2. Contexto calculado (`ctx`): para hoy y para mañana, `fechaLarga` ("jueves 18 de septiembre"), `diaSemana`, `precioMedio`, `horaMasBarata`, `precioMasBarato`, `horaMasCara`, `precioMasCaro`, `estado` (`A`/`B`/`C` para mañana; hoy siempre tiene dato), `fuente`. Precios en €/kWh con 3 decimales y coma decimal; horas en formato "de 03:00 a 04:00".
3. Sintaxis de placeholder: comentarios HTML que envuelven el fallback, por ejemplo `<!--dd:hoy.fechaLarga-->jueves<!--/dd-->`, para que el HTML fuente siga siendo válido y legible en `vite dev`. También placeholders de bloque por estado: `<!--dd:if manana.estado=A-->…<!--/dd-->`.
4. Registro del plugin en `vite.config.js`.
5. Tests con `node --test`: día normal con ESIOS (estado C); solo OMIE (B); ninguno (A); JSON vacío o malformado (no rompe, avisa); cambio de mes y de año (31 dic → 1 ene); zona horaria (build a las 23:30 UTC = 01:30 Madrid del día siguiente); formato de números y horas; `applyPlaceholders` deja el fallback cuando falta un dato.
6. Script `"test": "node --test scripts"` (o la carpeta elegida) en `package.json`.
7. Documentar en el propio plugin (cabecera) la lista de placeholders disponibles, que es el contrato para las fases 4-6.

## Fuera de alcance

Editar cualquier `index.html` (lo hacen las fases 4-6). Cambiar `tomorrow.js` o `table.js`. Generar el sitemap.

## Tareas

- [x] Rama `fase-3-plugin-datos-dia`
- [x] `scripts/vite-plugin-daily-data.mjs` con `computeDailyContext`, `applyPlaceholders` y el plugin
- [x] Registro en `vite.config.js`
- [x] Tests `node --test` cubriendo los casos del alcance
- [x] Script `npm test`
- [x] `npm run build` con un placeholder de prueba temporal y comprobación en `build/`; retirar el placeholder de prueba
- [x] Cabecera del plugin con la lista de placeholders
- [x] Tests, lint y format en verde
- [x] PR

## Criterios de aceptación

- `npm test` en verde con al menos 8 casos.
- `npm run build` termina sin errores y sin cambios en el HTML generado de páginas que no usan placeholders (`diff` de `build/index.html` antes/después limitado a nada).
- `node -e "import('./scripts/vite-plugin-daily-data.mjs').then(m=>console.log(Object.keys(m)))"` lista `dailyDataPlugin`, `computeDailyContext`, `applyPlaceholders`.
- Con `TZ=UTC` forzado y `now` = 23:30 UTC, `computeDailyContext` devuelve la fecha de Madrid del día siguiente (test).
- Con un JSON vacío el build no falla y el placeholder conserva su fallback (test).

## Skills recomendados

- `unit-testing:test-automator` (agente): para diseñar la batería de casos de `computeDailyContext`.
- `code-refactorer`: si el plugin crece, para mantener separadas las funciones puras del hook de Vite.
- `/code-review` antes de la PR; `/create-commit` y `/create-pr`.

## PROMPT

```
Vamos a ejecutar la Fase 3 del Sprint 01 de "apaga-luz". Lee docs/sprints/01/README.md y docs/sprints/01/fase-3-plugin-datos-dia.md. Antes de escribir nada, lee enteros: vite.config.js, source/javascript/tomorrow.js (líneas 1-120, lógica de selección OMIE/ESIOS), omie_dataset.js, scripts/add-og-tags.mjs, package.json, y los primeros 5 registros de public/data/today_price.json, tomorrow_price.json y omie_data.json. Las decisiones están cerradas y no se re-preguntan: build-time con transformIndexHtml, selección por dato (no por hora), Europe/Madrid, placeholders en comentarios HTML con fallback, tests con node --test y script npm test. Orden: funciones puras + tests primero, después el hook de Vite y el registro en vite.config.js, después la cabecera con el contrato de placeholders. No edites ningún index.html más allá de una prueba temporal que retiras antes del commit. Crea la rama fase-3-plugin-datos-dia y ejecuta el alcance completo. Antes de abrir la PR, lanza /code-review y atiende sus hallazgos.
```

## Extensión en la fase 6

Claves nuevas en `hoy.` y `manana.`: `esLaborable` (false en sábado, domingo y festivos nacionales de fecha fija; existe aunque no haya datos), `precioValle`, `precioLlano`, `precioPunta` (media por franja 2.0TD; en día no laborable solo `precioValle`, con la media del día). Festivos móviles y autonómicos no se detectan. Tests en `scripts/__tests__/vite-plugin-daily-data.test.mjs`.
