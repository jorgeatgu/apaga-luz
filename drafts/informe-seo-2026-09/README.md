# Informe SEO y plan de acción — 18 septiembre 2026

**Fuentes**: Google Search Console (dominio `sc-domain:apaga-luz.com`, Web), GA4 (propiedad p286166564), Ahrefs Webmaster Tools (plan gratuito: solo dominio propio, sin Content Gap).
**Periodo principal**: 16 jun – 15 sep 2026 vs 16 jun – 15 sep 2025 (interanual para neutralizar el verano). Serie de 16 meses para tendencia.
**Datos crudos**: `scratchpad/data/` de la sesión (gsc-queries-yoy.md, gsc-pages-yoy.md, gsc-monthly-16m.csv, gsc-tecnico.md, ga4.md, ahrefs.md). Copiados en `./datos/`.

## Resumen ejecutivo

1. **GA4 no mide desde mediados de junio**: el commit `674f83d1` (26 may 2026) eliminó el tag `G-E9V8ZPM3P0` de todas las páginas. La "caída de visitas" de GA4 es un fallo de medición. Restaurarlo es la acción 1.
2. **Los clics reales caen un 22 % interanual, pero las impresiones un 74 %**. La marca ("apaga luz" y variantes) sostiene el sitio con 26,4K clics; el tráfico **no-marca cae de 6.485 a 1.730 clics (-73 %)**.
3. **La caída de impresiones es continua desde diciembre 2025** (541K/mes) hasta agosto 2026 (119K/mes). No es estacional: el sitio pierde visibilidad en las consultas genéricas "precio luz hoy / mañana".
4. **La home posiciona para casi todo** (421 keywords, 92,6 % del tráfico estimado en Ahrefs), en posiciones 12-26 para las genéricas de gran volumen, y sigue ganando a los artículos dedicados en las consultas Iberdrola/Naturgy/PVPC.
5. **El blog aporta 185 clics en 3 meses** entre 37 artículos. Los artículos del sprint de mayo posicionan (Naturgy pasó de pos 69 a 9) pero con CTR del 0,1-0,3 %. Escribir más artículos no es la palanca ahora; la palanca es **las páginas-herramienta** (home, precio-luz-manana) y su CTR.
6. **Técnico sano** salvo detalles: `/Blog` da 404 y recibe enlaces, `/precio-luz-manana` sin barra responde 200 (duplicado con 55 dominios de referencia), 2 artículos rastreados sin indexar, 6 URLs con INP > 200 ms.

## 1. Recap de tráfico (GSC)

| Métrica | 16 jun–15 sep 2026 | mismo periodo 2025 | Δ |
|---|---|---|---|
| Clics | 34.400 | 44.300 | -22 % |
| Impresiones | 421.000 | 1.610.000 | -74 % |
| CTR | 8,2 % | 2,7 % | +5,5 pp |
| Posición media | 17,6 | 17,0 | +0,6 |

Serie mensual (clics / impresiones):

| Mes | Clics | Impresiones | Pos |
|---|---|---|---|
| 2025-06 | 18.695 | 949.695 | 14,0 |
| 2025-07 | 14.985 | 539.673 | 17,9 |
| 2025-08 | 13.213 | 410.251 | 20,3 |
| 2025-09 | 11.408 | 304.546 | 16,2 |
| 2025-10 | 11.955 | 337.829 | 10,8 |
| 2025-11 | 13.442 | 479.166 | 10,0 |
| 2025-12 | 13.890 | 541.461 | 12,0 |
| 2026-01 | 14.163 | 372.211 | 13,8 |
| 2026-02 | 12.400 | 317.086 | 12,0 |
| 2026-03 | 14.787 | 364.448 | 11,4 |
| 2026-04 | 12.174 | 251.083 | 12,3 |
| 2026-05 | 11.264 | 190.947 | 15,8 |
| 2026-06 | 11.314 | 153.438 | 17,6 |
| 2026-07 | 11.558 | 141.740 | 17,2 |
| 2026-08 | 11.141 | 118.597 | 18,5 |
| 2026-09 (15 d) | 5.779 | 74.766 | 18,0 |

Lectura: los clics están planos en 11-14K/mes porque son marca. Las impresiones no-marca se evaporan mes a mes desde diciembre: el sitio sale cada vez menos veces en las SERP de "precio luz hoy/mañana".

**Marca vs no-marca (1.535 consultas de la tabla)**

| Segmento | Clics 2026 | Clics 2025 | Impr 2026 | Impr 2025 |
|---|---|---|---|---|
| Marca (30 consultas con "apaga") | 26.354 | 28.228 | 35.157 | 38.168 |
| No-marca (1.505) | 1.730 | 6.485 | 265.538 | 939.388 |

**GA4 (solo válido hasta junio 2026)**: 770.931 sesiones sep 2025 – jun 2026, 75 % Direct, 22 % Organic Search, ingresos AdSense reportados 4.124 €.

## 2. Diagnóstico por páginas

| URL | Clics | Clics 2025 | Impr | Impr 2025 | Pos | Pos 2025 |
|---|---|---|---|---|---|---|
| / | 31.073 | 36.386 | 266.162 | 1.377.980 | 12,5 | 15,8 |
| /precio-luz-manana/ | 2.450 | 5.607 | 128.791 | 583.375 | 19,3 | 20,2 |
| /graficas/ | 918 | 2.156 | 55.991 | 459.761 | 25,9 | 14,9 |
| /horas-baratas-luz/ | 467 | 258 | 32.380 | 427.379 | 2,0 | 12,7 |
| /noticias/franjas-horarias-luz-hoy/ | 56 | 0 | 19.140 | 3.826 | 2,3 | 66,6 |
| /noticias/precio-luz-iberdrola-hoy/ | 33 | 0 | 16.646 | 0 | 7,7 | — |
| /noticias/ (37 artículos) | 185 | 761 | 72.024 | 486.935 | — | — |

- La home pierde 1,1 M de impresiones interanuales. Su posición media "mejora" porque ha dejado de aparecer en las consultas donde estaba en pos 20-30.
- `/precio-luz-manana/` es la segunda página y la mayor oportunidad: 129K impresiones a posición 19.
- `/horas-baratas-luz/` y `/franjas-horarias-luz-hoy/` aparecen en posición 2 con CTR < 1,5 %: patrón típico de **cita en AI Overview** (Ahrefs cuenta 18 apariciones en AIO y 38 en AI Mode). Impresión sin clic.

## 3. Diagnóstico por consultas

**Mayores pérdidas no-marca** (clics 2026 / 2025, impresiones 2026 / 2025, posición 2026 / 2025):

| Consulta | Clics | Impr | Pos |
|---|---|---|---|
| precio de la luz mañana | 196 / 1.519 | 18.950 / 89.748 | 10,2 / 8,8 |
| precio luz mañana | 169 / 1.140 | 25.974 / 130.688 | 10,5 / 9,2 |
| precio de la luz hoy hora a hora | 1 / 213 | 850 / 43.592 | 21,9 / 9,2 |
| precio de la luz hoy | 49 / 215 | 41.438 / 25.814 | 9,0 / 9,9 |
| precio luz hoy | 188 / 252 | 12.942 / 35.154 | 12,6 / 9,8 |
| tarifa luz mañana | 183 / 291 | 28.570 / 9.904 | 10,0 / 9,3 |
| precio de la luz | 89 / 154 | 3.485 / 14.126 | 20,0 / 10,3 |

Cluster "mañana": 836 clics (3.576 en 2025), 102K impresiones. Cluster "hoy": 517 clics (1.455), 113K impresiones. Ambos en **posición 9-12 con CTR 0,1-1 %**: primera página pero por debajo del pliegue, con AIO y comparadores grandes encima.

**Quick wins (pos 4-15, impresiones ≥ 300)**: precio de la luz hoy (41K impr, CTR 0,1 %), tarifa luz mañana (28,6K, 0,6 %), precio luz mañana (26K, 0,7 %), precio de la luz mañana (19K, 1 %), precio luz hoy (13K, 1,5 %), precio luz hoy iberdrola por horas (3,2K, 0,2 %), a qué hora es más barata la luz iberdrola hoy (2,3K, 0,2 %), precio luz naturgy hoy (1,1K, pos 9 desde 69), pvpc mañana (984, pos 9).

**Consultas con día de la semana** ("precio de la luz por horas hoy jueves/viernes/domingo/lunes") tienen CTR del 18-38 % con 15-20 clics cada una: el usuario responde muy bien cuando el título nombra el día.

**Ahrefs (URL que posiciona)**: "precio luz hoy" 596K vol → home pos 26. "precio luz hoy iberdrola" 25K vol, CPC 4,10 € → home pos 17 (no el artículo). "precio luz hoy naturgy por horas" 16K → home pos 13. "precio de la luz hoy hora a hora" 38K → home pos 18. La home es la URL para 421 keywords.

## 4. Balance de los sprints de mayo 2026

| Item | Estado | Resultado 3 meses (clics / impr / pos) | Estimación del brief |
|---|---|---|---|
| Iberdrola (edición canibalización) | Hecho 30 abr | 33 / 16.646 / 7,7 | 7.300 impr/mes |
| Naturgy (nuevo) | Publicado 12 may | 1 / 1.191 / 23,3 (query principal pos 9, antes 69) | ~570 clics/mes |
| Endesa (nuevo) | Publicado 14 may | 7 / 1.675 / 13,1 | ~375 clics/mes |
| PVPC (nuevo) | Publicado 12 may | 8 / 2.955 / 17,5 | ~1.500 clics/mes |
| Pilar tarifa luz (nuevo) | Publicado 14 may | 4 / 1.450 / 8,4 | 69K vol |
| Asturias, autoconsumo, kWh España, evolución histórico | Pendientes | — | — |
| Sprint 0 indexación Iberdrola/Canarias | Iberdrola ya indexada y con impresiones; Canarias 154 impr | | |

Conclusión: los artículos entran en el índice y suben posiciones, pero **la home sigue siendo la URL ganadora en Ahrefs para Iberdrola/Naturgy** y el CTR de los artículos es residual. Las estimaciones de clics del brief no se cumplen ni al 5 %. Los 4 pendientes se aplazan (ver acción 8).

## 5. Técnico

- Indexación: 33 indexadas / 26 excluidas (11 redirección, 7 canónica, 3 noindex, 1 404, 2 descubiertas, 2 rastreadas sin indexar: `consumo-fantasma-…` y `como-ahorrar-precio-luz-por-horas`).
- Sitemap correcto, 37 URLs, última lectura 10 sep.
- `/Blog` → 404 en producción, pero Ahrefs le atribuye 22 visitas y ranking para "precio luz hoy energia xxi" (pos 13). `/precio-luz-manana` sin barra → 200 con 55 dominios de referencia (canonical correcta, pero conviene 301).
- CWV: móvil 0 pobres, 6 "necesitan mejora" por INP > 200 ms (causa conocida: adsbygoogle). Ordenador todo verde.
- Ahrefs: DR 15, 574 dominios de referencia (histórico 1.200: se han perdido ~600), 1,5K backlinks.

## 6. Plan de acción priorizado

| # | Acción | Tipo | Esfuerzo | Impacto estimado | Fichero |
|---|---|---|---|---|---|
| 1 | Restaurar GA4 (carga diferida) | Técnico | 1 h | Recuperar medición y AdSense linking | [01-restaurar-ga4.md](./01-restaurar-ga4.md) |
| 2 | Convertir `/precio-luz-manana/` en la mejor página de "precio luz mañana" | Refresh | 1 día | +2.000-3.000 clics/3 m si pasa de pos 10 a 5 en 4 consultas (~100K impr) | [02-precio-luz-manana.md](./02-precio-luz-manana.md) |
| 3 | Home: título/H1 con día de la semana y quitar contenido de compañías | Refresh | ½ día | CTR de "precio de la luz hoy" (41K impr, 0,1 %) y descanibalizar Iberdrola/Naturgy | [03-home-descanibalizar.md](./03-home-descanibalizar.md) |
| 4 | Redirects `/Blog` y `/precio-luz-manana` sin barra | Técnico | 15 min | Recuperar 55+ dominios de enlace | [04-redirects.md](./04-redirects.md) |
| 5 | CTR de artículos "hoy": títulos con dato del día (Iberdrola, Naturgy, Endesa, PVPC) + actualizar "2025" en franjas-horarias | Refresh | ½ día | Iberdrola 16,6K impr a 0,2 % → 2 % = +300 clics/3 m | [05-ctr-articulos-hoy.md](./05-ctr-articulos-hoy.md) |
| 6 | Artículo nuevo: precio luz hoy Energía XXI | Creación | ½ día (clon de Iberdrola) | 3,3K impr/3 m ya existentes sin página; CPC 1,10 € | [06-energia-xxi.md](./06-energia-xxi.md) |
| 7 | Indexación: fusionar o ampliar los 2 artículos rastreados sin indexar | Refresh | 2 h | Higiene | [07-indexacion.md](./07-indexacion.md) |
| 8 | Pendientes de mayo: aplazar; solo kWh España si sobra tiempo | Decisión | — | Cluster kWh 2,4K impr / 7 clics | [08-pendientes-mayo.md](./08-pendientes-mayo.md) |
| 9 | INP en 6 URLs móviles | Técnico | Ya diagnosticado | Bajo | `drafts/INP_AUDIT_HANDOFF.md` |

### Calendario

| Semana | Acciones |
|---|---|
| 1 | 1 (GA4) + 4 (redirects) + 3 (home) |
| 2 | 2 (precio-luz-manana) |
| 3 | 5 (CTR artículos) + 6 (Energía XXI) + 7 (indexación) |
| 7-8 | `/audit-gsc` con export nuevo; comparar con `datos/` de este informe |

### Métricas de seguimiento (a 6 semanas)

- "precio luz mañana" + "precio de la luz mañana" + "tarifa luz mañana": posición media < 7 y CTR > 3 %.
- "precio de la luz hoy": CTR > 1 %.
- URL ganadora en Ahrefs para "precio luz hoy iberdrola" = artículo, no home.
- Impresiones mensuales GSC: frenar la caída (sep 2026 proyecta ~150K; objetivo oct ≥ 150K).
- GA4 midiendo sesiones ≈ clics GSC × 1,3-1,5.

## Reglas transversales

- Antes de editar cualquier página, `/audit-schema` antes y después.
- AEO obligatorio en refresh (skill `aeo-strategy`): Quick Answer 40-60 palabras con el dato del día, H2-pregunta, FAQPage.
- No crear artículos nuevos fuera de la acción 6 hasta cerrar 1-5.
- Sin emojis en código/HTML. Redirects 301 en `vercel.json`.
