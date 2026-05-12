# Sprint 2 — Precio luz Naturgy hoy

**Slug**: `precio-luz-naturgy-hoy`
**Keyword principal**: `precio luz Naturgy hoy`
**Impresiones mensuales (GSC)**: ~3.800
**Clicks recuperables top 3**: ~570 / mes
**Prioridad**: ⭐⭐⭐⭐ — **mejor ratio impacto/esfuerzo**
**Esfuerzo estimado**: 1 día (clonable de Iberdrola)
**Dependencias**: Sprint 0 (resolver indexación Iberdrola antes ayuda a confirmar plantilla)

## Contexto GSC

Cluster (top 10 por impresiones):

| Query | Impr | Clicks | CTR | Pos |
|---|---|---|---|---|
| precio luz hoy Naturgy por horas | 2.396 | 47 | 1.96% | 10.00 |
| precio luz Naturgy hoy | 569 | 3 | 0.53% | 10.01 |
| precio de la luz hoy en Naturgy | 181 | 0 | 0% | 20.30 |
| precio luz Naturgy hoy por horas | 178 | 0 | 0% | 9.95 |
| precio de la luz hoy por horas Naturgy | 138 | 0 | 0% | 9.88 |
| precio luz hoy por horas Naturgy | 113 | 0 | 0% | 9.13 |
| precio luz mañana Naturgy por horas | 107 | 0 | 0% | 8.87 |
| precio luz Naturgy por horas | 90 | 0 | 0% | 10.28 |
| precio luz hoy Naturgy | 79 | 0 | 0% | 11.67 |

**Total cluster**: ~3.800 impr / mes, posición media 9–11.

**Dónde aterrizan hoy**: home `/`.
**Plantilla a clonar**: `noticias/precio-luz-iberdrola-hoy/index.html` (misma estructura, cambiar "Iberdrola" por "Naturgy" y datos específicos).
**Artículos relacionados**:
- `noticias/precio-luz-iberdrola-hoy/` (plantilla)
- `noticias/companias-electricas-mas-baratas-2026/`
- `noticias/mejor-comercializadora-pvpc/`

## Fase 0 — Briefing (15 min)

- [ ] Confirmar slug `precio-luz-naturgy-hoy` (paralelo a iberdrola)
- [ ] Verificar que el artículo Iberdrola está bien estructurado antes de clonar (Sprint 0 idealmente resuelto)
- [ ] Decidir: ¿mismo tono comercial o más informativo?

## Fase 1 — SERP research (1 h, reducida porque clonamos)

- [ ] Top 10 SERP de "precio luz Naturgy hoy"
- [ ] ¿AI Overview? ¿Compite Naturgy.com directamente?
- [ ] People Also Ask
- [ ] Diferencias con SERP de "precio luz Iberdrola hoy" — ¿qué hace especial el caso Naturgy?
- Output: `drafts/sprint-articulos-gsc-2026-05/naturgy-serp.md` (puede ser breve)

## Fase 2 — Outline + Quick Answer + FAQ (45 min)

- [ ] H1: "Precio de la luz con Naturgy hoy: tarifas, horas y comparativa"
- [ ] H2 pregunta obligatorio: "¿Cuál es el precio de la luz con Naturgy hoy?"
- [ ] H2 propuestos:
  1. Tarifas eléctricas de Naturgy: precio fijo vs indexada
  2. Precio Naturgy por horas hoy y mañana
  3. ¿Cómo se calcula el precio de la luz de Naturgy?
  4. Comparativa Naturgy vs Iberdrola vs Endesa
  5. Preguntas frecuentes sobre la tarifa de Naturgy
- [ ] Quick Answer:
  > El precio de la luz con Naturgy hoy varía según el tramo horario: las horas valle (00:00–08:00) son las más baratas, mientras que las horas punta (10:00–14:00 y 18:00–22:00) son las más caras. Naturgy ofrece tanto tarifa indexada al PVPC como tarifas de precio fijo; el coste depende de cuál tengas contratada.
- [ ] FAQ (mínimo 3):
  1. ¿Es Naturgy una comercializadora libre o regulada?
  2. ¿Cómo consultar el precio de Naturgy mañana?
  3. ¿Naturgy es más barata que Iberdrola?
- Output: `drafts/sprint-articulos-gsc-2026-05/naturgy-outline.md`

## Fase 3 — Drafting (2–3 h)

- [ ] **Clonar** `noticias/precio-luz-iberdrola-hoy/index.html` a `noticias/precio-luz-naturgy-hoy/index.html`
- [ ] Sustituir referencias "Iberdrola" → "Naturgy"
- [ ] Adaptar tarifas específicas de Naturgy (Tarifa Por Uso, By You, etc.)
- [ ] Actualizar tabla comparativa
- [ ] Mantener estructura idéntica (CTA, sponsor card, related posts)
- [ ] Longitud objetivo: 1.000-1.500 palabras

## Fase 4 — Schemas + meta + internal links (45 min)

- [ ] JSON-LD: copiar JSON-LD del artículo Iberdrola y adaptar
- [ ] Meta title: "Precio luz Naturgy hoy 2026: tarifas por horas"
- [ ] Meta description: incorporar "Naturgy", "precio", "tarifa", "hoy"
- [ ] Internal links DESDE:
  - `noticias/precio-luz-iberdrola-hoy/` (sección "comparativa con otras compañías")
  - `noticias/companias-electricas-mas-baratas-2026/`
  - home (sección destacada compañías)
- [ ] Internal links HACIA:
  - `noticias/precio-luz-iberdrola-hoy/`
  - (cuando exista) `noticias/precio-luz-endesa-hoy/`
  - `noticias/mejor-comercializadora-pvpc/`
  - `/graficas/`
- [ ] `/audit-schema` validación

## Fase 5 — Publish (45 min)

Checklist estándar (ver "Reglas transversales" en `README.md` del sprint):

- [ ] **Artículo HTML**: `noticias/precio-luz-naturgy-hoy/index.html` clonado de `noticias/precio-luz-iberdrola-hoy/index.html`.
- [ ] **Blog index**: añadir card en `noticias/index.html` respetando orden cronológico.
- [ ] **Home**: añadir card en `index.html` (raíz) dentro del grid `blog-section`.
- [ ] **Sitemap**: añadir `<url>` en `public/sitemap.xml` con `lastmod` actual y `priority` 0.80.
- [ ] **Validar schemas**: ejecutar `/audit-schema` sobre el nuevo artículo.
- [ ] **Smoke test local**: abrir el HTML y comprobar render + ausencia de 404 en links internos.
- [ ] **Verificar móvil**: Lighthouse/PageSpeed sobre el preview.
- [ ] **Commit + push** (Vercel auto-deploy).
- [ ] **GSC URL Inspection** → solicitar indexación del nuevo URL.

## Fase 6 — Monitor post-publish

- [ ] **Semana +1**: indexado? posición inicial.
- [ ] **Semana +2**: clicks/impr (objetivo ≥ 100 clicks/mes en 2 semanas).
- [ ] **Semana +4**: ¿desplaza al home del SERP para queries Naturgy?
- [ ] **Semana +8**: posición consolidada, decisión.

## Notas de ejecución

- **Ya posicionas pos 9-11 sin artículo**: con artículo dedicado top 5 alcanzable en 4-6 semanas.
- **Cuidado con datos cambiantes**: las tarifas de Naturgy cambian. Hacer el artículo evergreen (concepto + tabla horas), no listar precios concretos que envejecen.
- **CTA**: igual que en Iberdrola — comparador / cambio de tarifa.
