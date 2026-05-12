# Sprint 4 — Mejor tarifa luz autoconsumo y excedentes 2026

**Slug**: `mejor-tarifa-luz-autoconsumo-excedentes-2026`
**Keyword principal**: `mejor tarifa luz con excedentes`
**Impresiones mensuales (GSC)**: ~2.500
**Clicks recuperables top 3**: ~375 / mes (potencial real más alto: intención comercial convierte mejor)
**Prioridad**: ⭐⭐⭐⭐⭐ — **la intención más comercial de todo el sprint**
**Esfuerzo estimado**: 2-3 días (ranking comparativo)
**Dependencias**: ninguna, pero conviene tener tabla actualizada de comercializadoras y compensaciones

## Contexto GSC

Cluster (top 15 por impresiones):

| Query | Impr | Clicks | CTR | Pos |
|---|---|---|---|---|
| mejor tarifa luz con placas solares | 709 | 3 | 0.42% | 18.24 |
| mejor tarifa autoconsumo | 514 | 1 | 0.19% | 16.27 |
| tarifa solar | 292 | 7 | 2.40% | 51.24 |
| comparador tarifas luz autoconsumo | 246 | 0 | 0% | 18.48 |
| tarifas luz con placas solares | 205 | 1 | 0.49% | 35.01 |
| comparador tarifas luz con excedentes | 191 | 1 | 0.52% | **2.69** ⚡ |
| mejor tarifa solar | 180 | 0 | 0% | 24.91 |
| comparativa tarifas solares | 136 | 1 | 0.74% | 11.68 |
| comparador tarifas autoconsumo con excedentes | 132 | 0 | 0% | **4.52** ⚡ |
| comparador tarifas luz con placas solares | 124 | 0 | 0% | **3.74** ⚡ |
| mejores tarifas luz con placas solares | 100 | 0 | 0% | 20.53 |
| tarifa luz con placas solares | 97 | 1 | 1.03% | 36.18 |
| mejor tarifa compensación excedentes | 88 | 0 | 0% | 44.52 |
| mejores tarifas autoconsumo | 88 | 1 | 1.14% | 5.40 |
| mejor tarifa con placas solares | 34 | 1 | 2.94% | 10.00 |

⚡ = ya posicionas en top 5 sin artículo dedicado → potencial alto.

**Total cluster**: ~2.500 impr / mes. Intención **comercial pura**.

**Dónde aterrizan hoy**: home `/` + parcialmente `noticias/tarifas-placas-solares/` (13.445 impr pos 16.75).
**Riesgo de canibalización**: con `noticias/tarifas-placas-solares/`. Diferenciar:
- **Existente** = "tarifas de placas solares" (instalación + autoconsumo conceptual)
- **Nuevo** = "ranking comparativo comercial de tarifas con compensación de excedentes y batería virtual"
- Enlazar entre ambos con anchor diferenciado.

## Fase 0 — Briefing (20 min)

- [ ] Confirmar slug (alternativas: `mejor-tarifa-luz-excedentes-2026`, `comparador-tarifas-autoconsumo-2026`)
- [ ] Decidir si incluir **batería virtual** como sub-tema o artículo aparte (queries existen: "tarifa con batería virtual", "mejor tarifa con batería virtual" — baja impresión pero alta intención)
- [ ] Definir si el artículo es **ranking comercial** (tipo afiliación, con tabla y CTAs) o **guía neutra** + tabla informativa
- [ ] Identificar las 5-8 comercializadoras a comparar (Holaluz, Repsol, Naturgy, Iberdrola, Endesa, Octopus, Plenitude, etc.)

## Fase 1 — SERP research (2 h)

- [ ] Top 10 SERP de "mejor tarifa luz con excedentes" y "comparador tarifas autoconsumo"
- [ ] **Crítico**: AI Overview muy probable en este SERP (query "mejor" = clásico de AI Overviews)
- [ ] People Also Ask completo
- [ ] Identificar competidores: Selectra, Acierto, Cambiotuenergia, OCU, especializados solares
- [ ] Captar qué tarifas mencionan ellos y con qué compensación €/kWh
- Output: `drafts/sprint-articulos-gsc-2026-05/autoconsumo-serp.md`

## Fase 2 — Outline + Quick Answer + FAQ (1.5 h)

- [ ] H1: "Mejor tarifa de luz con autoconsumo y compensación de excedentes 2026"
- [ ] H2 pregunta obligatorio: "¿Cuál es la mejor tarifa de luz con autoconsumo y excedentes?"
- [ ] H2 propuestos:
  1. Comparativa de tarifas con compensación de excedentes (tabla)
  2. Cómo funciona la compensación de excedentes en España
  3. Mejor tarifa de luz con batería virtual
  4. Compensación simplificada vs mercado: ¿cuál elegir?
  5. ¿Cuánto se paga por kWh excedente en 2026?
  6. Preguntas frecuentes sobre autoconsumo con excedentes
- [ ] Quick Answer:
  > La mejor tarifa de luz con autoconsumo y compensación de excedentes en 2026 es la que paga más por cada kWh exportado a la red. Las opciones top compensan entre 0,06 € y 0,15 €/kWh excedente. Holaluz, Repsol y Naturgy ofrecen las compensaciones más altas a fecha de mayo de 2026.
- [ ] **Tabla comparativa** (datos reales con fecha):
  | Comercializadora | Compensación €/kWh excedente | Permanencia | Modalidad |
  |---|---|---|---|
  | ... | ... | ... | ... |
- [ ] FAQ (mínimo 6):
  1. ¿Qué es la compensación de excedentes?
  2. ¿Cuánto me pagarán por mis excedentes solares?
  3. ¿Qué es la batería virtual y conviene?
  4. ¿Compensación simplificada o venta a mercado?
  5. ¿Necesito cambiar de comercializadora para tener excedentes?
  6. ¿Hay tope mensual a la compensación?
- Output: `drafts/sprint-articulos-gsc-2026-05/autoconsumo-outline.md`

## Fase 3 — Drafting (4-5 h)

- [ ] Ejecutar `/write-article mejor-tarifa-luz-autoconsumo-excedentes-2026` con outline + tabla
- [ ] Generar `noticias/mejor-tarifa-luz-autoconsumo-excedentes-2026/index.html`
- [ ] Usar como referencia estructural `noticias/companias-electricas-mas-baratas-2026/index.html` (ya es ranking)
- [ ] **Crítico**: tabla actualizada con compensaciones reales — fecha de actualización visible
- [ ] Longitud objetivo: 2.000-2.800 palabras (artículo comercial extenso)
- [ ] CTAs explícitos hacia comparador / contratación

## Fase 4 — Schemas + meta + internal links (1.5 h)

- [ ] JSON-LD: `Article` + `FAQPage` + `BreadcrumbList` + **`ItemList`** (para el ranking) + opcionalmente `Product` por cada tarifa con `Offer`
- [ ] Meta title: "Mejor tarifa luz con excedentes 2026: comparativa autoconsumo"
- [ ] Meta description: incluir "excedentes", "autoconsumo", "compensación", "comparativa", "2026"
- [ ] Internal links DESDE:
  - `noticias/tarifas-placas-solares/` (anchor: "comparativa de tarifas con excedentes")
  - `noticias/companias-electricas-mas-baratas-2026/`
  - `noticias/comparador-tarifas-luz-y-gas/`
  - home (sección destacada)
- [ ] Internal links HACIA:
  - `noticias/tarifas-placas-solares/`
  - `noticias/companias-electricas-mas-baratas-2026/`
  - (si existe) `noticias/pvpc-precio-hoy-tarifa-regulada/`
- [ ] `/audit-schema` (verificar especialmente `ItemList` y `Product`)

## Fase 5 — Publish (45 min)

- [ ] Build local
- [ ] Verificar tabla responsive móvil (crítico, tablas se rompen)
- [ ] Commit + push
- [ ] GSC URL Inspection
- [ ] Compartir en redes (artículo "evergreen comercial" merece amplificación)

## Fase 6 — Monitor post-publish

- [ ] **Semana +1**: indexación.
- [ ] **Semana +2**: posición. Objetivo: top 10 desde día 1 dado que el dominio ya rankea pos 3-5 en queries afines.
- [ ] **Semana +4**: ¿el artículo aparece citado en AI Overview? Revisar con `aeo-strategy`.
- [ ] **Semana +8**: clicks reales. Si la conversión es buena, considerar variaciones (`mejor-tarifa-bateria-virtual-2026`).
- [ ] **Mantenimiento trimestral**: actualizar tabla de compensaciones (cambian con frecuencia).

## Notas de ejecución

- **Atención fecha**: las compensaciones €/kWh cambian. Marcar "Última actualización: DD/MM/2026" visible.
- **Riesgo legal/comercial**: si publicas afirmaciones sobre compensaciones de empresas, ser preciso. Citar fuentes oficiales (web de cada comercializadora).
- **Oportunidad de monetización**: si tienes acuerdos con comparadores/comercializadoras, este es el artículo donde poner CTAs de afiliación.
- **Batería virtual como artículo derivado**: si funciona bien, sale Sprint 7 (no incluido en este plan).
