# Sprint 3 — Precio luz Endesa hoy

**Slug**: `precio-luz-endesa-hoy`
**Keyword principal**: `precio luz Endesa hoy`
**Impresiones mensuales (GSC)**: ~2.500
**Clicks recuperables top 3**: ~375 / mes
**Prioridad**: ⭐⭐⭐⭐ — gemelo de Naturgy, mismo patrón
**Esfuerzo estimado**: 1 día (clonable)
**Dependencias**: ideal después de Sprint 2 (refinar plantilla con experiencia Naturgy)

## Contexto GSC

Cluster (top 10):

| Query | Impr | Clicks | CTR | Pos |
|---|---|---|---|---|
| precio-luz hoy Endesa | 503 | 0 | 0% | 10.38 |
| precio luz mañana Endesa | 473 | 0 | 0% | 9.40 |
| precio luz Endesa hoy | 257 | 1 | 0.39% | 9.91 |
| precio kwh Endesa hoy | 242 | 0 | 0% | 16.46 |
| precio luz hoy Endesa | 235 | 0 | 0% | 11.71 |
| precio luz Endesa mañana | 227 | 0 | 0% | 8.96 |
| precio de la luz hoy Endesa | 176 | 0 | 0% | 9.55 |
| Endesa precio luz hoy | 39 | 0 | 0% | 15.08 |
| precio luz hoy Endesa por horas | 88 | 0 | 0% | 8.85 |
| precio luz Endesa hoy por horas | 88 | 0 | 0% | 8.85 |
| Energía XXI precio luz mañana | 319 | 4 | 1.25% | 5.06 |
| Energía XXI precio luz hoy | 59 | 1 | 1.69% | 22.07 |

**Total cluster**: ~2.500 impr / mes (más 380 de Energía XXI = comercializadora de referencia de Endesa), posición media 9–12.

**Dónde aterrizan hoy**: home `/`.
**Plantilla a clonar**: `noticias/precio-luz-iberdrola-hoy/index.html` (o `noticias/precio-luz-naturgy-hoy/` si Sprint 2 ya está hecho).
**Particularidad**: Endesa opera bajo **dos marcas**: Endesa (mercado libre) + Energía XXI (PVPC / regulada). El artículo debe cubrir ambas.

## Fase 0 — Briefing (15 min)

- [ ] Confirmar slug `precio-luz-endesa-hoy`
- [ ] Decidir si Energía XXI tiene sub-sección dedicada o artículo aparte (sugerencia: sub-sección dentro de éste para no fragmentar)
- [ ] Validar plantilla (Iberdrola o Naturgy si existe)

## Fase 1 — SERP research (1 h)

- [ ] Top 10 SERP de "precio luz Endesa hoy"
- [ ] ¿AI Overview? ¿Compite endesa.com?
- [ ] People Also Ask
- [ ] Buscar si SERP separa Endesa y Energía XXI o los mezcla
- Output: `drafts/sprint-articulos-gsc-2026-05/endesa-serp.md`

## Fase 2 — Outline + Quick Answer + FAQ (45 min)

- [ ] H1: "Precio de la luz con Endesa hoy: tarifas, Energía XXI y comparativa"
- [ ] H2 pregunta obligatorio: "¿Cuánto cuesta hoy la luz con Endesa?"
- [ ] H2 propuestos:
  1. Endesa Energía XXI (PVPC) vs tarifas de mercado libre
  2. Precio luz Endesa hoy por horas
  3. Precio luz Endesa mañana: cómo consultarlo
  4. ¿Es Endesa más barata que Iberdrola y Naturgy?
  5. Preguntas frecuentes sobre Endesa y Energía XXI
- [ ] Quick Answer:
  > El precio de la luz con Endesa depende de la tarifa: si tienes la Tarifa Regulada (Endesa Energía XXI) sigue el PVPC con precios horarios; si tienes una tarifa de mercado libre, el precio es fijo según tu contrato. Las horas más baratas suelen ser de 00:00 a 08:00.
- [ ] FAQ:
  1. ¿Qué es Endesa Energía XXI?
  2. ¿Cómo cambiarme de Endesa al PVPC?
  3. ¿Cuál es la tarifa más barata de Endesa hoy?
  4. ¿Endesa cobra peajes diferentes según la hora?
- Output: `drafts/sprint-articulos-gsc-2026-05/endesa-outline.md`

## Fase 3 — Drafting (2–3 h)

- [ ] Clonar plantilla a `noticias/precio-luz-endesa-hoy/index.html`
- [ ] Sustituir referencias y datos de Endesa
- [ ] **Crítico**: sección clara distinguiendo Endesa (mercado libre) de Energía XXI (comercializadora regulada PVPC)
- [ ] Longitud objetivo: 1.200-1.700 palabras

## Fase 4 — Schemas + meta + internal links (45 min)

- [ ] JSON-LD: `Article` + `FAQPage` + `BreadcrumbList`
- [ ] Meta title: "Precio luz Endesa hoy 2026: tarifas y Energía XXI"
- [ ] Meta description: incluir "Endesa", "Energía XXI", "PVPC", "precio luz hoy"
- [ ] Internal links DESDE:
  - `noticias/precio-luz-iberdrola-hoy/`
  - `noticias/precio-luz-naturgy-hoy/`
  - `noticias/companias-electricas-mas-baratas-2026/`
  - `noticias/mejor-comercializadora-pvpc/` (mencionar Energía XXI)
- [ ] Internal links HACIA:
  - `noticias/precio-luz-iberdrola-hoy/`
  - `noticias/precio-luz-naturgy-hoy/`
  - `noticias/mejor-comercializadora-pvpc/`
  - (cuando exista) `noticias/pvpc-precio-hoy-tarifa-regulada/`
- [ ] `/audit-schema`

## Fase 5 — Publish (45 min)

Checklist estándar (ver "Reglas transversales" en `README.md` del sprint):

- [ ] **Artículo HTML**: `noticias/precio-luz-endesa-hoy/index.html` clonado de `noticias/precio-luz-iberdrola-hoy/index.html` (o del de Naturgy si Sprint 2 ya está hecho).
- [ ] **Blog index**: añadir card en `noticias/index.html` respetando orden cronológico.
- [ ] **Home**: añadir card en `index.html` (raíz) dentro del grid `blog-section`.
- [ ] **Sitemap**: añadir `<url>` en `public/sitemap.xml` con `lastmod` actual y `priority` 0.80.
- [ ] **Validar schemas**: ejecutar `/audit-schema` sobre el nuevo artículo.
- [ ] **Smoke test local**: abrir el HTML y comprobar render + ausencia de 404 en links internos.
- [ ] **Verificar móvil**: Lighthouse/PageSpeed sobre el preview.
- [ ] **Commit + push** (Vercel auto-deploy).
- [ ] **GSC URL Inspection** → solicitar indexación del nuevo URL.

## Fase 6 — Monitor post-publish

- [ ] **Semana +1**: indexación + posición inicial.
- [ ] **Semana +2**: clicks/impr (objetivo ≥ 50 clicks/mes a 2 semanas).
- [ ] **Semana +4**: revisar si "Energía XXI" capta queries propias.
- [ ] **Semana +8**: decisión.

## Notas de ejecución

- **Energía XXI** tiene queries propias (~380 impr/mes) que también queremos capturar. Sub-sección dedicada con su propio H3.
- Cluster más pequeño que Naturgy pero **misma estructura** = casi cero coste marginal si ya hiciste Naturgy.
- Triple comparativa "Iberdrola vs Endesa vs Naturgy" se vuelve cruzable entre los 3 artículos.
