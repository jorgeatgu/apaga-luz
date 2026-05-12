# Sprint 6 — Evolución del precio de la luz en España (histórico)

**Slug**: `evolucion-precio-luz-espana-historico`
**Keyword principal**: `evolución precio luz España`
**Impresiones mensuales (GSC)**: ~1.500
**Clicks recuperables top 3**: ~225 / mes
**Prioridad**: ⭐⭐⭐ — volumen medio pero **ya posicionas top 3-5** sin artículo
**Esfuerzo estimado**: 2 días (requiere serie histórica de datos)
**Dependencias**: ninguna estricta, pero ideal después de Sprint 5 (kWh) para enlazar

## Contexto GSC

Cluster (top 15):

| Query | Impr | Clicks | CTR | Pos |
|---|---|---|---|---|
| evolucion precio luz | 236 | 41 | 17.37% | **3.67** ⚡ |
| evolucion precio electricidad España | 197 | 28 | 14.21% | **4.37** ⚡ |
| evolución precio kwh España 10 años | 151 | 5 | 3.31% | 9.69 |
| evolución precio luz | 126 | 16 | 12.70% | 8.25 |
| evolucion precio luz España | 118 | 29 | 24.58% | **5.36** ⚡ |
| evolucion del precio de la luz en España | 31 | 8 | 25.81% | **3.97** ⚡ |
| evolucion del precio de la electricidad en España | 23 | 6 | 26.09% | **4.00** ⚡ |
| evolución precio electricidad | 33 | 3 | 9.09% | 5.42 |
| evolucion precio kwh España | 44 | 10 | 22.73% | **3.80** ⚡ |
| precio luz historico | 61 | 39 | 63.93% | **1.54** ⚡⚡ |
| historico precio luz | 59 | 28 | 47.46% | **1.32** ⚡⚡ |
| precio de la luz historico | 48 | 22 | 45.83% | **1.52** ⚡⚡ |
| evolución precio de la luz | 51 | 3 | 5.88% | 4.51 |
| evolución del precio de la luz | 22 | 3 | 13.64% | 4.18 |
| cuanto ha subido la luz en los últimos 5 años | 50 | 2 | 4.00% | 6.86 |
| precio luz evolucion | 78 | 19 | 24.36% | **4.40** ⚡ |
| historico precio luz España | 15 | 7 | 46.67% | 1.87 |
| precio kwh historico | 3 | 1 | 33.33% | 2.00 |

⚡ = pos top 5 sin artículo dedicado. **Posición casi inmejorable**: el dominio ya tiene autoridad para este cluster.

**Total cluster**: ~1.500 impr / mes, posiciones 1-6 en la mayoría.

**Dónde aterrizan hoy**: probablemente home `/` o `/graficas/` (que muestra tiempo real, no histórico).
**Particularidad**: **CTRs altísimos** en algunas queries (47-64%) → cuando aparece bien posicionado, la gente clica. Pero el contenido que ven no es un artículo específico → oportunidad de mover esos clicks a una URL dedicada con mejor convertibilidad.

## Fase 0 — Briefing (15 min)

- [ ] Confirmar slug `evolucion-precio-luz-espana-historico`
- [ ] **Decisión clave**: ¿el artículo incluye **gráfica histórica interactiva** o solo tabla estática + imagen?
  - Opción A: gráfica interactiva (D3.js, ya usado en `/graficas/`). Requiere datasource con serie histórica.
  - Opción B: tabla + imagen + enlace a `/graficas/`. Más rápido.
  - Recomendación: **Opción B** primero; si funciona bien, evolucionar a A.
- [ ] Definir años a cubrir: 2015-2026 (10 años, alinea con query "evolución precio kwh España 10 años")

## Fase 1 — SERP research + datasource (2 h)

- [ ] Top 10 SERP de "evolución precio luz España" y "precio luz histórico"
- [ ] AI Overview presente? (probable en query "cuánto ha subido la luz")
- [ ] PAA
- [ ] **Datasource histórico**: ESIOS / OMIE publican series anuales de PVPC. Identificar URL/API/CSV descargable.
  - ESIOS API: https://api.esios.ree.es (ya usada en el proyecto para datos diarios)
  - OMIE: https://www.omie.es/es/file-download (también ya usada)
- [ ] Decidir entre serie diaria agregada por año, o medias mensuales
- Output: `drafts/sprint-articulos-gsc-2026-05/evolucion-serp.md` + `drafts/sprint-articulos-gsc-2026-05/evolucion-dataset.csv` (serie histórica)

## Fase 2 — Outline + Quick Answer + FAQ (1 h)

- [ ] H1: "Evolución del precio de la luz en España: histórico 2015-2026"
- [ ] H2 pregunta obligatorio: "¿Cómo ha evolucionado el precio de la luz en España?"
- [ ] H2 propuestos:
  1. Histórico del precio de la luz por años (tabla + gráfica)
  2. Cuánto ha subido la luz en los últimos 5 años
  3. Por qué subió el precio de la luz en 2021-2022 (crisis del gas)
  4. Evolución del kWh y previsión 2026
  5. Picos históricos y mínimos del precio de la luz
  6. Preguntas frecuentes sobre la evolución del precio
- [ ] Quick Answer:
  > El precio de la luz en España se ha multiplicado por más de 2,5 en los últimos 10 años: pasó de unos 50 €/MWh en 2015 a máximos de 545 €/MWh en marzo de 2022 por la crisis del gas. En 2026 se ha estabilizado en torno a los 100–130 €/MWh medios.
- [ ] FAQ (mínimo 5):
  1. ¿Cuál ha sido el precio máximo histórico de la luz en España?
  2. ¿Cuánto costaba la luz en 2015 / 2020 / 2022?
  3. ¿Por qué se disparó el precio de la luz en 2022?
  4. ¿La luz ha bajado en 2024-2026?
  5. ¿Cómo será el precio de la luz en los próximos años?
- Output: `drafts/sprint-articulos-gsc-2026-05/evolucion-outline.md`

## Fase 3 — Drafting (3-4 h)

- [ ] `/write-article evolucion-precio-luz-espana-historico`
- [ ] Generar `noticias/evolucion-precio-luz-espana-historico/index.html`
- [ ] **Crítico**: tabla histórica con datos verificables — precio medio anual €/MWh
- [ ] Incluir imagen/gráfica (puede ser screenshot de `/graficas/` adaptado, o asset propio)
- [ ] Longitud objetivo: 1.500-2.000 palabras

## Fase 4 — Schemas + meta + internal links (1 h)

- [ ] JSON-LD: `Article` + `FAQPage` + `BreadcrumbList` + **`Dataset`** (si publicas la serie como CSV/JSON) + opcionalmente `ImageObject` para la gráfica
- [ ] Meta title: "Evolución precio luz España: histórico 2015-2026"
- [ ] Meta description: incluir "evolución", "precio luz", "España", "histórico", años
- [ ] Internal links DESDE:
  - `/graficas/`
  - `noticias/precio-luz-por-hora/`
  - (si existe) `noticias/precio-kwh-espana-cuanto-cuesta-2026/`
  - `noticias/luz-barata-2026/`
- [ ] Internal links HACIA:
  - `/graficas/` (anchor: "ver precio actual en tiempo real")
  - (si existe) `noticias/precio-kwh-espana-cuanto-cuesta-2026/`
  - `noticias/iva-factura-electrica/`
- [ ] `/audit-schema` (validar `Dataset` si se usa)

## Fase 5 — Publish (30 min)

- [ ] Build local
- [ ] Verificar tabla responsive móvil
- [ ] Commit + push
- [ ] GSC URL Inspection
- [ ] Sitemap

## Fase 6 — Monitor post-publish

- [ ] **Semana +1**: indexación.
- [ ] **Semana +2**: posición. Objetivo agresivo: **top 3 desde día 1** (ya rankeas top 5 sin artículo).
- [ ] **Semana +4**: clicks. CTR del cluster es alto (15-60%) → si llegas a pos 1-3, el upside es brutal.
- [ ] **Semana +8**: actualizar tabla con datos finales del año si procede.

## Notas de ejecución

- **Mantenimiento anual**: la serie histórica crece cada año. Plan para añadir 2026/2027 cuando cierre el año.
- **Schema `Dataset`** te puede dar visibilidad como dataset citable en respuestas de IA — coherente con la regla AEO del proyecto.
- **CTR alto pre-existente**: este cluster premia muy bien la posición top. Cuidado con el título y meta description para no perder CTR cuando creemos el artículo nuevo (el contenido actual en home ya convierte).
- **Cruce con `/graficas/`**: no canibalizar. Diferenciar: histórico (este) vs tiempo real (graficas).
