# Retrospectiva — Sprint 01

Cierre: **viernes 18 de septiembre de 2026**. Esta fecha es el baseline para `/audit-gsc` a las 6 semanas (**viernes 30 de octubre de 2026**).

## Baseline al cierre

### Google Search Console (web, `sc-domain:apaga-luz.com`, leído el 18 sep a las 15:2x CEST; datos hasta el 15 sep)

| Periodo | Clics | Impresiones | CTR | Posición |
|---|---|---|---|---|
| 7 días (9-15 sep) | 2,61K | 32,3K | 8,1 % | 15,9 |
| 28 días | 10,2K | 118K | 8,7 % | 19,1 |
| 3 meses (= informe) | 34,4K | 421K | 8,2 % | 17,6 |

Media de la última semana: ~373 clics/día. Serie mensual y consultas en `drafts/informe-seo-2026-09/datos/`.

### GA4 (p286166564)

- Snippet desplegado el 18 sep hacia las 11:37 CEST (PR #73).
- Tiempo real a las 15:2x CEST: 48 usuarios activos en 30 min, 11 en 5 min; fuentes `(direct)` y `google`.
- Sesiones/día: los informes estándar del 18 sep solo muestran unas 3 sesiones por el retraso de procesamiento (24-48 h). **Pendiente**: anotar las sesiones del sábado 19 y el domingo 20 cuando estén procesadas; objetivo ≈ 1,3-1,5 × clics GSC (~490-560/día con la media actual). El criterio "≥ 1.000 sesiones/día" de la fase 9 no casa con los ~373 clics/día actuales; lo razonable es el ratio.

### PageSpeed Insights móvil (18 sep, 14:51-14:59 CEST)

| Página | INP campo | LCP campo | CLS campo | CWV | Lab: rendimiento · FCP · LCP · TBT · CLS | Baseline lab (fase 1) |
|---|---|---|---|---|---|---|
| `/` | 227 ms (necesita mejorar) | 2,0 s | 0,09 | No superada | 81 · 1,9 s · 3,0 s · 20 ms · 0,242 | 56 · — · 6,0 s · 40 ms · 0,182 |
| `/precio-luz-manana/` | 161 ms (bueno) | 0,7 s | 0,08 | Superada | 63 y 61 · 5,4 s · 6,3 s · 0 ms · 0,037 | 98 · — · 2,0 s · 10 ms · 0,086 |
| `precio-luz-iberdrola-hoy` | sin datos de URL (origen: 222 ms) | origen 1,8 s | origen 0,09 | — | 67 · 3,4 s · 6,0 s · 60 ms · 0,023 | sin baseline |

- Campo idéntico al baseline: es un p75 de 28 días y el sprint se desplegó hoy. Ningún INP cambia de bucket. El efecto real se verá hacia mediados de octubre.
- Lab de `/precio-luz-manana/`: la caída 98 → 61-63 **no es del sprint**. El despliegue de hace dos días (anterior al sprint, `apaga-1q2ot04ls-…vercel.app`) medido a la misma hora da FCP 4,4 s y LCP 5,7 s. Es variación del entorno de laboratorio. El LCP de esa página en estado A es el aviso naranja que pinta `tomorrow.js` (2.230 ms de retraso de render).
- CLS lab de la home 0,182 → 0,242: vigilar (el campo sigue en 0,09).
- El baseline PSI de Iberdrola (fase 6) nunca se tomó; los valores de arriba quedan como baseline.

## QA en producción (18 sep)

- Redirects: `/Blog`, `/blog`, `/precio-luz-manana`, `/graficas`, `/horas-baratas-luz`, `/preguntas`, `/tipos-tarifas-electricas` → 301 a la versión con barra o a `/noticias/`; `/ahorra-en-tu-factura` y `/noticias/como-ahorrar-precio-luz-por-horas/` → 301 a `precio-luz-horas-ahorrar-factura-energetica/`.
- Titles y H1: "viernes 18 de septiembre" en home, Iberdrola, Naturgy, Endesa, PVPC, franjas y Energía XXI; "sábado 19 de septiembre" en `/precio-luz-manana/`. `G-E9V8ZPM3P0` aparece 2 veces (script + config) en las 10 URLs muestreadas.
- Prueba de resultados enriquecidos: **0 errores en las 10 URLs** (las 8 editadas + horas-ahorrar y consumo-fantasma). Detecta Article + BreadcrumbList en todas y Dataset en home y mañana. FAQPage no aparece como resultado enriquecido (Google lo limita a sitios de salud y administración desde 2023); no es un error. Avisos no críticos iguales en todas: falta `image` y `dateModified` sin hora ni zona (`2026-09-18`).
- GSC: sitemap reenviado el 18 sep, leído el mismo día, "Correcto", 37 páginas. Indexación solicitada para las 10 URLs en el orden decidido, sin llegar al límite de cuota. Estados previos: 8 indexadas; `precio-luz-energia-xxi-hoy` "Descubierta: actualmente sin indexar" (ya por el sitemap); `consumo-fantasma-…` "Rastreada: actualmente sin indexar" (último rastreo 21 ago, anterior a la ampliación).

### Estados de `/precio-luz-manana/`

| Estado | Esperado | Observado |
|---|---|---|
| A | desde medianoche | 14:42 CEST: A correcto ("sábado 19", dato de hoy) |
| B | tras OMIE (~13:30) | 18:30 CEST (el workflow de OMIE programado a las 15:17 corrió a las 18:26) |
| C | tras ESIOS (20:15) | 21:36 CEST (lanzado a mano con `workflow_dispatch` a las 21:35; ningún turno programado había corrido todavía) |

Hallazgo: los crons de GitHub llegaban con 3-5 h de retraso (OMIE, programado a las 12:15 UTC, corría hacia las 17:00 UTC; ESIOS, programado a las 19:22 UTC, hacia las 22:13 UTC). Con eso B aparecía hacia las 19:00 de Madrid y C casi nunca se veía: a las 22:13 UTC en Madrid ya es el día siguiente y "mañana" pasa al otro día. Vercel sí redespliega con cada commit de Flat (por su integración Git; `deploy.yml` no se dispara con los push de `GITHUB_TOKEN`). Primera corrección: turnos redundantes en `omie.yml` y `flat-tomorrow.yml` (PR #81). No bastó: el 18 sep GitHub descartó dos de los cuatro turnos de OMIE y retrasó ~3 h los demás.

Retrasos de la semana del 12 al 18 sep (hora de Madrid):

| Workflow | Programado | Real | Retraso |
|---|---|---|---|
| `omie.yml` | 14:15 | 17:34 - 20:04 | 3 h 20 - 5 h 50 |
| `flat-tomorrow.yml` | 21:22 | 23:27 - 00:32 | 2 h - 3 h 10 |
| `flat.yml` | 23:57 | 01:27 - 02:01 | 1 h 30 - 2 h |
| `flat-canary.yml` | 00:55 | 02:27 - 02:59 | 1 h 30 - 2 h |

Corrección definitiva (PR #88, mergeada el 18 sep): cron-job.org lanza `workflow_dispatch` en hora de Madrid (OMIE 13:30, ESIOS 20:15, `flat.yml` 00:00, Canarias 01:00) con un token de permisos finos (solo este repo, Actions: write). Cada workflow conserva un cron de GitHub de respaldo. `update_create_datasets.js` toma el día del fichero de ESIOS en vez de la fecha UTC del runner y no duplica días en `all_prices.json`: antes, el `flat.yml` del 15 sep (02:01 de Madrid) probablemente generó el día equivocado. Prueba del 18 sep a las 22:03: `workflow_dispatch` inmediato, success en 23 s y sin commit. La cabecera `X-GitHub-Api-Version: 2022-11-28` está obsoleta desde el 10 mar 2026 y se retira el 10 mar 2028: hay que actualizarla en las cuatro tareas antes de esa fecha.

### Móvil real

_Pendiente del resultado del usuario._

## Qué funcionó

- Plugin de Vite con placeholders y fallback: la fecha correcta en title/H1 de 8 páginas sin JS en runtime, y los tres estados de mañana decididos por el dato.
- Fases pequeñas con PR y `/code-review` cada una: 8 PR mergeadas el mismo día sin romper producción.
- Schema: 0 errores en la prueba de Google en todo lo tocado.

## Qué no

- Los baselines PSI de las fases 4, 5 y 6 no se anotaron (la fase 1 sí). El lab de PSI varía tanto entre horas que sin baseline del mismo momento no sirve para comparar; hace falta medir antes/después en la misma sesión o comparar contra un despliegue anterior, como se hizo aquí.
- La premisa "se redespliega 3-4 veces al día a la hora del dato" no se verificó hasta el QA: los crons llevaban semanas llegando tarde.
- Empate de la hora mínima: el Quick Answer (plugin, gana la más temprana) y el widget de `main.js` (gana la más tardía) pueden mostrar horas distintas. **Corregido el 19 sep** en `calculatePriceStats` (`main.js`): en empate gana la hora más temprana, como en el plugin.

## Qué cambia para el siguiente

- Medir PSI antes/después en la misma sesión, o contra la URL de un despliegue anterior.
- Verificar en los próximos días que los workflows corren a las horas de cron-job.org (13:30, 20:15, 00:00, 01:00) y que los respaldos de GitHub no hacen commit.
- Ventana nocturna: resuelta con el disparo de `flat.yml` a las 00:00 de Madrid, que hace commit y redespliega con la fecha nueva.
- Sprint INP (`drafts/INP_AUDIT_HANDOFF.md`) y revisión de backlinks rotos en Ahrefs.

## Seguimiento a 6 semanas (30 oct 2026)

Export de GSC y `/audit-gsc` comparado con `drafts/informe-seo-2026-09/datos/`. Objetivos:

- "precio luz mañana" + "precio de la luz mañana" + "tarifa luz mañana": posición < 7 y CTR > 3 %.
- "precio de la luz hoy": CTR > 1 %.
- URL ganadora en Ahrefs para "precio luz hoy iberdrola" = artículo, no home.
- Impresiones de octubre ≥ 150K.
- GA4 ≈ 1,3-1,5 × clics GSC.
- Indexación de `precio-luz-energia-xxi-hoy` y `consumo-fantasma-…`.
