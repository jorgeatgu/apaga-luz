# Sprint 1 — PVPC: precio hoy y tarifa regulada

**Slug**: `pvpc-precio-hoy-tarifa-regulada`
**Keyword principal**: `PVPC hoy`
**Impresiones mensuales (GSC)**: ~10.500
**Clicks recuperables top 3**: ~1.500 / mes
**Prioridad**: ⭐⭐⭐⭐⭐ — **el de mayor ROI**
**Esfuerzo estimado**: 2–3 días
**Dependencias**: Sprint 0 (opcional, no bloquea)

## Contexto GSC

Cluster de queries (Consultas.csv, últimos 3 meses — top 15 por impresiones):

| Query | Impr | Clicks | CTR | Pos |
|---|---|---|---|---|
| pvpc hoy | 4.427 | 0 | 0% | 9.65 |
| precio pvpc hoy | 1.373 | 2 | 0.15% | 10.53 |
| precio luz pvpc hoy | 1.113 | 4 | 0.36% | 12.80 |
| pvpc esios | 1.063 | 0 | 0% | 8.04 |
| esios pvpc | 884 | 1 | 0.11% | 8.24 |
| tarifa pvpc hoy | 363 | 0 | 0% | 12.23 |
| pvpc luz hoy | 335 | 1 | 0.30% | 8.84 |
| precios pvpc hoy | 207 | 0 | 0% | 10.20 |
| pvpc | 156 | 1 | 0.64% | 45.47 |
| precio pvpc luz hoy | 145 | 0 | 0% | 13.05 |
| pvpc precio hoy | 143 | 0 | 0% | 12.81 |
| tarifa pvpc | 98 | 1 | 1.02% | 45.39 |
| pvpc historico | 94 | 0 | 0% | 32.09 |
| evolucion pvpc | 75 | 1 | 1.33% | 18.88 |
| esios precios pvpc | 59 | 1 | 1.69% | 7.98 |

**Total cluster**: ~10.500 impr / mes, posición media 8–12.

**Dónde aterrizan hoy**: home `/` (sin artículo dedicado al concepto PVPC en sí).
**Artículos relacionados**:
- `noticias/mejor-comercializadora-pvpc/index.html` (3.914 impr, pos 16.91) — cubre **comercializadoras** de PVPC, no la tarifa.
- Página genérica `/preguntas/` recibe queries informacionales.

**Riesgo de canibalización**: con `mejor-comercializadora-pvpc`. Diferenciar:
- Este artículo (`pvpc-precio-hoy-tarifa-regulada`) = **qué es PVPC + precio actual + cómo se calcula**.
- Existente (`mejor-comercializadora-pvpc`) = **qué comercializadora elegir para contratar PVPC**.
- Enlazar entre ambos con anchor text diferenciado.

## Fase 0 — Briefing (15 min, en chat)

- [ ] Confirmar slug `pvpc-precio-hoy-tarifa-regulada` (alternativa: `que-es-pvpc-precio-hoy`)
- [ ] Validar que el artículo es **conceptual evergreen** (no datos diarios) — datos en vivo van en `/preguntas/` o tabla embeded
- [ ] Decidir si se integra widget de precio PVPC en tiempo real (cruza con `/graficas/`)

## Fase 1 — SERP research (1–2 h)

- [ ] Top 10 SERP de "pvpc hoy" y "qué es pvpc"
- [ ] Comprobar si hay **AI Overview** (probable, query informacional alta intención)
- [ ] Listar People Also Ask
- [ ] Identificar competidores: ¿Selectra? ¿OCU? ¿Tarifaluzhora? ¿Roams?
- [ ] Detectar qué cubren ellos que nosotros no
- Output: `drafts/sprint-articulos-gsc-2026-05/pvpc-serp.md`

## Fase 2 — Outline + Quick Answer + FAQ (1 h)

- [ ] H1: "PVPC hoy: precio actual y guía completa de la tarifa regulada"
- [ ] H2 pregunta obligatorio: "¿Qué precio tiene el PVPC hoy?"
- [ ] H2 propuestos:
  1. ¿Qué es el PVPC y cómo se calcula?
  2. Precio PVPC hoy por horas (tabla con datos en vivo / enlace ESIOS)
  3. Diferencia entre PVPC y tarifas de mercado libre
  4. Histórico del PVPC: evolución y picos
  5. Comercializadoras de referencia para contratar PVPC (CTA → artículo existente)
  6. ¿Quién puede contratar PVPC?
- [ ] Quick Answer (40-60 palabras):
  > El PVPC (Precio Voluntario para el Pequeño Consumidor) es la tarifa eléctrica regulada por el Gobierno de España. Su precio varía cada hora y se publica en la web de ESIOS (Red Eléctrica). Solo pueden contratarlo hogares con potencia ≤ 10 kW a través de comercializadoras de referencia como Curenergía, Energía XXI o Régsiti.
- [ ] FAQ (mínimo 5):
  1. ¿Cómo se calcula el precio del PVPC?
  2. ¿Es más barato el PVPC que el mercado libre?
  3. ¿Cómo cambiar mi tarifa al PVPC?
  4. ¿Qué es ESIOS y por qué publica el precio?
  5. ¿Cuándo es más barato el PVPC durante el día?
- Output: `drafts/sprint-articulos-gsc-2026-05/pvpc-outline.md`

## Fase 3 — Drafting (3–4 h)

- [ ] Ejecutar `/write-article pvpc-precio-hoy-tarifa-regulada` con outline + research como input
- [ ] Generar `noticias/pvpc-precio-hoy-tarifa-regulada/index.html`
- [ ] Revisar estructura vs `noticias/mejor-comercializadora-pvpc/index.html` (mismo dominio temático)
- [ ] Longitud objetivo: 1.500-2.000 palabras
- [ ] Incluir tabla precio PVPC (puede ser estática + CTA a `/graficas/` para tiempo real)

## Fase 4 — Schemas + meta + internal links (1 h)

- [ ] JSON-LD: `Article` + `FAQPage` + `BreadcrumbList` + opcionalmente `DefinedTerm` para "PVPC"
- [ ] Meta title (≤ 60 chars): "PVPC hoy 2026: precio, tarifa regulada y cómo funciona"
- [ ] Meta description (≤ 155 chars): incorporar "PVPC", "precio", "tarifa regulada", "ESIOS"
- [ ] Internal links DESDE:
  - `noticias/mejor-comercializadora-pvpc/index.html` (anchor: "qué es el PVPC")
  - `noticias/guia-tipos-tarifas-electricas-2026/index.html`
  - `/preguntas/` si procede
  - home (sección destacada)
- [ ] Internal links HACIA:
  - `noticias/mejor-comercializadora-pvpc/index.html`
  - `/graficas/`
  - `noticias/franjas-horarias-luz-hoy/index.html`
- [ ] `/audit-schema` validación

## Fase 5 — Publish (45 min)

Checklist estándar (ver "Reglas transversales" en `README.md` del sprint):

- [ ] **Artículo HTML**: `noticias/pvpc-precio-hoy-tarifa-regulada/index.html` clonado de `noticias/precio-luz-iberdrola-hoy/index.html`.
- [ ] **Blog index**: añadir card en `noticias/index.html` respetando orden cronológico.
- [ ] **Home**: añadir card en `index.html` (raíz) dentro del grid `blog-section`.
- [ ] **Sitemap**: añadir `<url>` en `public/sitemap.xml` con `lastmod` actual y `priority` 0.80.
- [ ] **Validar schemas**: ejecutar `/audit-schema` sobre el nuevo artículo.
- [ ] **Smoke test local**: abrir el HTML y comprobar render + ausencia de 404 en links internos.
- [ ] **Verificar móvil**: Lighthouse/PageSpeed sobre el preview.
- [ ] **Commit + push** (Vercel auto-deploy).
- [ ] **GSC URL Inspection** → solicitar indexación del nuevo URL.

## Fase 6 — Monitor post-publish

- [ ] **Semana +1**: ¿indexado en GSC? Posición inicial keyword principal.
- [ ] **Semana +2**: primeras impresiones, clicks, CTR.
- [ ] **Semana +4**: posición consolidada. ¿AI Overview cita el artículo? Revisar con `aeo-strategy`.
- [ ] **Semana +8**: decisión. Si posición ≤ 5 → mantener. Si 6-15 → optimizar con `/audit-gsc`. Si > 15 → re-fase 1 con nuevo SERP.

## Notas de ejecución

- **Atención a la fecha**: el PVPC cambia diariamente. El artículo debe ser **conceptual** (no tabla estática con precios que envejecen). Si quieres precio en vivo, embeber widget que apunte a `/graficas/` o `/precio-luz-manana/`.
- **Schema `DefinedTerm`** ayuda a aparecer como definición autoritativa en SERPs.
- **Aprovechar el dominio**: el sitio ya rankea pos 8-10 sin artículo dedicado. Con artículo bien hecho, top 3 es alcanzable rápido.
