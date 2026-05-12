# Sprint 5 — Precio del kWh en España: cuánto cuesta y cómo se calcula

**Slug**: `precio-kwh-espana-cuanto-cuesta-2026`
**Keyword principal**: `precio del kWh hoy`
**Impresiones mensuales (GSC)**: ~3.000
**Clicks recuperables top 3**: ~450 / mes
**Prioridad**: ⭐⭐⭐ — informacional con buen volumen, posición actual mejorable
**Esfuerzo estimado**: 1.5–2 días
**Dependencias**: ideal después de PVPC (referenciable cruzado)

## Contexto GSC

Cluster (top 15):

| Query | Impr | Clicks | CTR | Pos |
|---|---|---|---|---|
| precio kwh hoy | 1.157 | 0 | 0% | 14.34 |
| precio kwh | 411 | 1 | 0.24% | 35.82 |
| precio kwh Endesa hoy | 242 | 0 | 0% | 16.46 |
| precio kw hora hoy | 194 | 0 | 0% | 14.52 |
| precio kilovatio hora hoy | 194 | 0 | 0% | 18.65 |
| precio kilovatio hora | 179 | 0 | 0% | 24.65 |
| precio kwh España hoy | 174 | 0 | 0% | 18.79 |
| precio kwh España | 166 | 0 | 0% | 23.75 |
| precio del kwh | 135 | 0 | 0% | 27.51 |
| coste kw hora | 107 | 0 | 0% | 26.00 |
| precio del kw | 95 | 0 | 0% | 33.95 |
| precio medio kwh España | 92 | 0 | 0% | 17.97 |
| precio kilovatio hoy | 93 | 0 | 0% | 18.00 |
| coste kwh | 89 | 0 | 0% | 35.06 |
| precio kw hora mercado regulado | 86 | 0 | 0% | 24.60 |
| precio del kwh hoy | n/a | n/a | n/a | n/a |
| precio kwh historico | 3 | 1 | 33.33% | 2.00 |

**Total cluster**: ~3.000 impr / mes, posición media **20-35** → con artículo dedicado, salto grande de posición.

**Dónde aterrizan hoy**: home `/`.
**Sin artículo dedicado** — el concepto "qué cuesta el kWh" no tiene página propia.
**Artículos relacionados**:
- `noticias/precio-luz-iberdrola-hoy/`, `noticias/precio-luz-canarias-hoy/`, etc. (tocan precio pero no el concepto kWh)
- `noticias/iva-factura-electrica/` (concepto factura)

## Fase 0 — Briefing (15 min)

- [ ] Confirmar slug. Alternativas: `precio-kwh-2026`, `cuanto-cuesta-kwh-espana-2026`. El propuesto enfatiza "cuánto cuesta".
- [ ] Decidir enfoque: **conceptual evergreen** (qué es kWh, cómo se calcula, factores) o **diario** (tabla precio kWh hoy con widget). Recomendación: **conceptual + tabla anual + enlace a /graficas/** para tiempo real.

## Fase 1 — SERP research (1.5 h)

- [ ] Top 10 SERP de "precio kWh hoy" y "precio del kWh España"
- [ ] **AI Overview muy probable** — query informacional pura, "cuánto cuesta X"
- [ ] People Also Ask: probablemente "¿cuánto cuesta un kWh?", "¿cómo se calcula el kWh?", "¿qué es un kWh?"
- [ ] Competidores: OCU, Selectra, Roams, Tarifaluzhora, Iberdrola/Endesa blog
- Output: `drafts/sprint-articulos-gsc-2026-05/kwh-serp.md`

## Fase 2 — Outline + Quick Answer + FAQ (1 h)

- [ ] H1: "Precio del kWh en España 2026: cuánto cuesta y cómo se calcula"
- [ ] H2 pregunta obligatorio: "¿Cuánto cuesta el kWh en España hoy?"
- [ ] H2 propuestos:
  1. Qué es un kWh y cómo se factura
  2. Precio del kWh hoy por horas (tabla resumen + link a `/graficas/`)
  3. Precio medio del kWh en España: histórico y previsión
  4. Cómo calcular el precio del kWh en tu factura
  5. Diferencias por compañía: Iberdrola, Endesa, Naturgy
  6. Preguntas frecuentes sobre el kWh
- [ ] Quick Answer:
  > El precio del kWh en España hoy varía entre 0,05 € y 0,30 € según la hora del día y la tarifa contratada. En el PVPC cambia cada hora; en mercado libre suele ser un precio fijo. El precio medio anual del kWh ronda los 0,15 €.
- [ ] FAQ (mínimo 5):
  1. ¿Qué significa kWh en la factura?
  2. ¿Cómo calcular cuánto cuesta cargar el coche eléctrico?
  3. ¿Por qué el kWh varía cada hora?
  4. ¿Cuántos kWh consume mi casa al mes de media?
  5. ¿Por qué mi factura cobra más por kWh de lo que dice el precio diario?
- Output: `drafts/sprint-articulos-gsc-2026-05/kwh-outline.md`

## Fase 3 — Drafting (2-3 h)

- [ ] `/write-article precio-kwh-espana-cuanto-cuesta-2026`
- [ ] Generar `noticias/precio-kwh-espana-cuanto-cuesta-2026/index.html`
- [ ] Incluir **fórmula de cálculo** del precio kWh facturado (precio mercado + peajes + cargos + impuestos)
- [ ] Tabla con precio medio kWh por años (referencia evolución)
- [ ] Longitud objetivo: 1.500-2.000 palabras

## Fase 4 — Schemas + meta + internal links (1 h)

- [ ] JSON-LD: `Article` + `FAQPage` + `BreadcrumbList` + **`HowTo`** (cómo calcular el kWh) + opcionalmente `DefinedTerm` para "kWh"
- [ ] Meta title: "Precio del kWh España 2026: cuánto cuesta hoy y cómo se calcula"
- [ ] Meta description: incluir "kWh", "precio", "España", "calcular"
- [ ] Internal links DESDE:
  - `noticias/iva-factura-electrica/`
  - `noticias/precio-luz-por-hora/`
  - (si existe) `noticias/pvpc-precio-hoy-tarifa-regulada/`
  - home
- [ ] Internal links HACIA:
  - `/graficas/`
  - `noticias/precio-luz-iberdrola-hoy/`, `noticias/precio-luz-endesa-hoy/`, `noticias/precio-luz-naturgy-hoy/` (cuando existan)
  - `noticias/iva-factura-electrica/`
  - (si existe) `noticias/evolucion-precio-luz-espana-historico/`
- [ ] `/audit-schema`

## Fase 5 — Publish (30 min)

- [ ] Build local
- [ ] Commit + push
- [ ] GSC URL Inspection
- [ ] Sitemap

## Fase 6 — Monitor post-publish

- [ ] **Semana +1**: indexación.
- [ ] **Semana +2**: ¿salto de posición desde 20-35 a 10-15?
- [ ] **Semana +4**: top 10 alcanzable. ¿AI Overview cita?
- [ ] **Semana +8**: top 5 objetivo. Si no, refinar Quick Answer y FAQ.

## Notas de ejecución

- **Posición actual 20-35**: hay margen de mejora enorme con artículo conceptual bien construido. Quick Answer + FAQ + HowTo es la combinación que más mueve este tipo de queries informacionales en AI Overviews.
- **Schema `HowTo`** especialmente valioso para "cómo calcular el precio del kWh en tu factura".
- **Evergreen**: no datar precios concretos en el texto — usar rangos (0,05–0,30 €) y enlazar a tabla actualizable.
- **Cluster por compañía** se solapa: queries "precio kwh Endesa hoy" pueden ir aquí o al artículo Endesa. Decidir en Fase 0: sugerencia → kWh genérico aquí, kWh por compañía mencionado en breve dentro de cada artículo de compañía.
