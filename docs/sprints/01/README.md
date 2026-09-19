# Sprint 01 — Recuperar visibilidad orgánica: medición, páginas-herramienta y CTR

## Visión

Nace del informe `drafts/informe-seo-2026-09/README.md` (18 sep 2026). Los clics caen un 22 % interanual y las impresiones un 74 %; la marca sostiene el sitio y el tráfico no-marca ha perdido el 73 %. La home posiciona para casi todo en posiciones 12-26, los artículos "hoy" tienen CTR del 0,1-0,3 %, y GA4 lleva sin medir desde mediados de junio porque el commit `674f83d1` eliminó el tag.

Este sprint no escribe contenido nuevo salvo un artículo (Energía XXI). Se centra en las **páginas-herramienta** (home y `/precio-luz-manana/`), en poner **la fecha y el dato del día en los títulos** (las consultas con día de la semana convierten al 18-38 % frente al 0,1-1 % del resto), en recuperar la medición y en cerrar los detalles técnicos que hacen perder enlaces.

Todo lo que sigue salió de la entrevista `/create-feature` del 18 de septiembre de 2026.

## Prerrequisito

- `main` limpio; los commits de Flat siguen entrando durante el sprint, así que cada rama se rebasa antes de la PR.
- Acceso a Google Search Console (dominio `sc-domain:apaga-luz.com`) y a GA4 (propiedad p286166564) para las comprobaciones de las fases 1 y 9.
- Leído `drafts/informe-seo-2026-09/README.md` y sus ficheros de acción: son la fuente de los números que se citan en cada fase.

## Decisiones cerradas

| Tema | Decisión | Descartado y por qué |
|---|---|---|
| Alcance | Acciones 1-7 del informe | Acción 8 ya es una decisión (aplazar/descartar pendientes de mayo). Acción 9 (INP) tiene su propio handoff en `drafts/INP_AUDIT_HANDOFF.md` |
| Títulos con fecha y dato | Plugin de Vite que, en `vite build`, sustituye placeholders del HTML con datos de `public/data/*.json`. `deploy.yml` ya redespliega con cada push a `public/**` (3-4 veces al día), así que el HTML estático siempre lleva la fecha correcta | Runtime JS: la SERP toma el snippet del HTML estático. Ambos: se hará solo si la fase 4 detecta páginas cacheadas con fecha vieja |
| Estados de `/precio-luz-manana/` | A) sin datos de mañana: fecha de mañana + "se publica a las 13:30 y 20:15" + dato de hoy. B) tras OMIE (~13:30): precio medio y horas más barata/cara de mañana, en lenguaje genérico "precio de la luz" sin decir mayorista, + aviso "hora a hora a las 20:15". C) tras ESIOS (20:15): PVPC completo. La selección la decide **el dato** (qué JSON contiene el día de mañana), no la hora del build | Mostrar el dato de hoy sin aviso (confunde); título sin fecha hasta tener datos (pierde el efecto del día) |
| Home, sección compañías | Solo tres enlaces con anchor exacto a los artículos de Iberdrola, Naturgy y Endesa; sin párrafos ni H2 con nombres de compañía | Eliminarla (los artículos pierden su enlace más fuerte); mantenerla (la home sigue canibalizando) |
| GA4 | Snippet anterior al commit `674f83d1`: carga en primera interacción o a los 5 s, en todas las páginas | `load + requestIdleCallback` y async en head: se prefiere el patrón ya probado en el sitio |
| Indexación | Fusionar `como-ahorrar-precio-luz-por-horas` en `precio-luz-horas-ahorrar-factura-energetica` con 301; ampliar `consumo-fantasma-…` con tabla de consumos y HowTo | Ampliar y diferenciar sin fusionar: más trabajo y sin garantía de indexación |
| Energía XXI | Artículo nuevo `noticias/precio-luz-energia-xxi-hoy/`, clon estructural del de Endesa | Meterlo en el artículo de Endesa: el cluster tiene demanda propia (3,3K impr sin página) |
| Git | Rama por fase + PR a `main`; `/code-review` antes de la PR; `/create-commit` y `/create-pr` | Commits directos a `main` |
| Tests | `node --test` para el plugin de Vite, script `npm test` nuevo | Vitest (dependencia nueva para un único módulo) |
| CWV | Toda fase que toque HTML mide INP en móvil antes y después (PageSpeed Insights) y no puede empeorar el bucket | — |
| Datos | No tocar `table.js`, `tomorrow.js`, `main.js` ni los JSON salvo lo imprescindible; smoke test manual de las tablas de hoy y mañana en cada fase que toque esas páginas | — |

## Principios técnicos

- HTML estático + Vite. Cada página nueva se registra en `vite.config.js` (`rollupOptions.input`) y en `public/sitemap.xml`.
- Sin emojis en código ni HTML. Redirects como `routes` con `status: 301` en `vercel.json`.
- Schema obligatorio en páginas editadas: `Article` + `FAQPage` + `BreadcrumbList`, author Organization "Apaga-luz", publisher con logo `apple-touch-icon.png`. Validar con `/audit-schema` antes y después.
- AEO (skill `aeo-strategy`): Quick Answer de 40-60 palabras antes del primer H2, H2 en forma de pregunta, FAQ mínimo 3 preguntas.
- Los placeholders del plugin tienen **siempre** un texto de fallback en el HTML fuente, de modo que `vite dev` y un build sin datos rindan una página válida.
- Copy hacia el usuario: "precio de la luz", nunca "mayorista" ni "PVPC" en el Quick Answer del estado B.

## Fases

| # | Fase | Documento | Depende de |
|---|---|---|---|
| 1 | Restaurar GA4 | [fase-1-ga4.md](./fase-1-ga4.md) | — |
| 2 | Redirects `/Blog` y `/precio-luz-manana` sin barra | [fase-2-redirects.md](./fase-2-redirects.md) | — |
| 3 | Plugin de Vite de datos del día + tests | [fase-3-plugin-datos-dia.md](./fase-3-plugin-datos-dia.md) | — |
| 4 | `/precio-luz-manana/`: título, Quick Answer, schema y enlaces | [fase-4-precio-luz-manana.md](./fase-4-precio-luz-manana.md) | 3 |
| 5 | Home: día de la semana, Quick Answer y descanibalizar compañías | [fase-5-home.md](./fase-5-home.md) | 3 |
| 6 | Artículos "precio luz hoy": CTR con dato del día + franjas 2026 | [fase-6-articulos-hoy.md](./fase-6-articulos-hoy.md) | 3 |
| 7 | Artículo Energía XXI | [fase-7-energia-xxi.md](./fase-7-energia-xxi.md) | 5, 6 |
| 8 | Indexación: fusión con 301 y ampliación de consumo fantasma | [fase-8-indexacion.md](./fase-8-indexacion.md) | 2, 7 |
| 9 | QA, Search Console y cierre | [fase-9-qa-cierre.md](./fase-9-qa-cierre.md) | todas |

Orden recomendado: 1, 2 y 3 en paralelo (worktrees separados: no comparten ficheros salvo que la 1 toca todos los HTML y la 3 solo `vite.config.js` y `scripts/`; rebase antes de la PR). Tras mergear la 3: 4, 5 y 6 en paralelo (páginas distintas). Luego 7, luego 8 (ambas tocan `vite.config.js`, `public/sitemap.xml`, `noticias/index.html` e `index.html`; van en serie). La 9 cierra.

## Riesgos

| Riesgo | Qué se hace | Plan B |
|---|---|---|
| Flat falla y el build inyecta la fecha de ayer | El plugin compara el día del JSON con la fecha del build; si no coincide usa el estado A (fecha correcta + aviso) | Fase 4 puede añadir refresco en runtime del título |
| El build corre en UTC y "mañana" se calcula mal | El plugin calcula fechas en `Europe/Madrid` con `Intl.DateTimeFormat` y lo cubre un test | — |
| Conflictos entre fases en `vite.config.js`, `sitemap.xml`, `index.html` | Dependencias declaradas (7 tras 5 y 6; 8 tras 7) | Rebase y resolución manual |
| GA4 vuelve a empeorar INP | Snippet ya probado (interacción o 5 s); fase 1 mide INP antes/después | Subir el fallback a 8 s |
| Google tarda semanas en reflejar los títulos nuevos | Fase 9 reenvía sitemap y pide indexación URL a URL | Segunda iteración con más enlazado interno |
| La fusión de artículos (fase 8) pierde alguna consulta con clics | Se revisa en GSC el artículo fusionado antes de redirigir (tenía 0 clics en 3 meses) | Revertir el 301 |

## Definición de hecho del sprint

- Las 9 fases mergeadas en `main` con su PR revisada por `/code-review`.
- `npm test` en verde (tests del plugin) y `npm run build` sin errores.
- `grep -c "G-E9V8ZPM3P0" build/**/index.html` devuelve 1 por página.
- `build/index.html` y `build/precio-luz-manana/index.html` contienen el día de la semana y la fecha del build en `<title>` y `<h1>`.
- PageSpeed Insights móvil: INP de home y precio-luz-manana no peor que antes del sprint (referencia en fase 1 y 4).
- `/audit-schema` sin errores en todas las páginas tocadas.
- GSC: sitemap reenviado, indexación solicitada para las URLs de las fases 4-8; GA4 registrando sesiones en tiempo real.
- `retro.md` escrito con la fecha de cierre, que es el baseline para `/audit-gsc` a las 6 semanas.

## Después de este sprint

- A las 6 semanas: export nuevo de GSC, `/audit-gsc`, comparar con `drafts/informe-seo-2026-09/datos/`. Métricas objetivo en el informe (sección "Métricas de seguimiento").
- Si la URL ganadora para "precio luz hoy iberdrola" sigue siendo la home, segunda iteración de descanibalización.
- Sprint INP (acción 9) a partir de `drafts/INP_AUDIT_HANDOFF.md`.
- Revisar en Ahrefs "Backlinks rotos" por si hay más URLs antiguas con enlaces (histórico 1.200 dominios, hoy 574).
