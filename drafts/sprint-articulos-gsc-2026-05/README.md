# Sprint artículos GSC — Mayo 2026

**Origen**: auditoría GSC `Últimos 3 meses, Web` (export `Desktop/apaga-luz.com-Performance-on-Search-2026-05-12`).
**Total clicks recuperables (top 3)**: ~3.500 – 4.500 / mes si se completan los 6 sprints.

## Cómo usar este sprint

Cada artículo tiene su fichero (`01-…`–`06-…`). El fichero contiene **fases** auto-contenidas: en cualquier conversación futura basta abrir el fichero correspondiente y decir "vamos con la fase X" — toda la info (cluster GSC, plantilla, schemas, Quick Answer borrador) está dentro.

Fases comunes para todos los artículos:

| Fase | Qué se hace | Duración aprox. | Output |
|---|---|---|---|
| **0. Briefing** | Confirmar keyword, slug, plantilla, scope | 15 min (en chat) | aprobación |
| **1. SERP research** | Top 10, AI Overview, PAA, gaps competencia | 1–2 h | `{slug}-serp.md` |
| **2. Outline + Quick Answer + FAQ** | H1, H2s, Quick Answer 40-60p, 5-8 FAQ | 1 h | `{slug}-outline.md` |
| **3. Drafting** | `/write-article` + generación HTML | 2–4 h | `noticias/{slug}/index.html` |
| **4. Schemas + meta + internal links** | JSON-LD, meta title/description, links | 1 h | artículo listo |
| **5. Publish** | Build, push, GSC URL Inspection | 30 min | publicado |
| **6. Monitor** | +1, +2, +4, +8 semanas | recurrente | datos GSC |

## Sprint 0 — Bloqueo previo (1–2 días)

**Antes de escribir nada nuevo**, hay artículos existentes que ya deberían captar tráfico pero **no aparecen en `Páginas.csv`** (= no están recibiendo impresiones detectadas por GSC):

- [ ] `noticias/precio-luz-iberdrola-hoy/index.html` → debería captar ~7.300 impr/mes del cluster Iberdrola
- [ ] `noticias/precio-luz-canarias-hoy/index.html` → debería captar ~900 impr/mes del cluster Canarias

**Diagnóstico a hacer**:
1. Comprobar que no tienen `<meta name="robots" content="noindex">` ni equivalente en headers.
2. Verificar que están en `public/sitemap.xml`.
3. Comprobar que hay al menos 2-3 enlaces internos hacia ellos desde artículos / home.
4. En GSC → URL Inspection → solicitar indexación si no aparecen como indexadas.
5. Confirmar que la URL canonical no apunta a otro sitio.

**Impacto si se arregla**: +8.000 impresiones/mes a coste casi cero. **Hacer esto primero** porque el ROI es inmediato y no requiere escribir.

## Orden recomendado de los sprints

Ordenado por **clicks recuperables / esfuerzo** (mejor primero):

| # | Slug | Impr/mes | Clicks recup. (top 3) | Esfuerzo | Fichero |
|---|---|---|---|---|---|
| 1 | `pvpc-precio-hoy-tarifa-regulada` | 10.500 | ~1.500 | Alto (artículo conceptual extenso) | [`01-pvpc.md`](./01-pvpc.md) |
| 2 | `precio-luz-naturgy-hoy` | 3.800 | ~570 | **Bajo** (clonable de Iberdrola) | [`02-naturgy.md`](./02-naturgy.md) |
| 3 | `precio-luz-endesa-hoy` | 2.500 | ~375 | **Bajo** (clonable de Iberdrola) | [`03-endesa.md`](./03-endesa.md) |
| 4 | `mejor-tarifa-luz-autoconsumo-excedentes-2026` | 2.500 | ~375 | Alto (intención comercial, ranking comparativo) | [`04-autoconsumo-excedentes.md`](./04-autoconsumo-excedentes.md) |
| 5 | `precio-kwh-espana-cuanto-cuesta-2026` | 3.000 | ~450 | Medio (conceptual + tabla cálculo) | [`05-kwh-espana.md`](./05-kwh-espana.md) |
| 6 | `evolucion-precio-luz-espana-historico` | 1.500 | ~225 | Medio (datos + gráficas serie histórica) | [`06-evolucion-historico.md`](./06-evolucion-historico.md) |

**Estrategia alternativa "victorias rápidas primero"**: si quieres acumular wins, invertir orden a `2 → 3 → 1 → 5 → 4 → 6`. Naturgy y Endesa son clonables del artículo existente de Iberdrola → cuestión de horas.

## Reglas transversales (aplican a todos los sprints)

- **AEO obligatorio** (regla del proyecto, ver skill `aeo-strategy`):
  - Quick Answer 40-60 palabras al inicio del artículo, antes de cualquier H2.
  - H2 obligatorio en forma de pregunta reproduciendo la keyword principal.
  - `FAQPage` schema con mínimo 3 preguntas.
- **Schemas mínimos**: `Article` + `FAQPage` + `BreadcrumbList`. Añadir `HowTo` si la query contiene "cómo" y `ItemList`/`Product` si hay ranking comparativo.
- **Convención de slugs**: kebab-case, sin tildes, con `-2026` cuando aplique (siguiendo patrón de `companias-electricas-mas-baratas-2026`).
- **Plantilla HTML**: usar `noticias/precio-luz-iberdrola-hoy/index.html` como referencia estructural — head, meta, JSON-LD, CTA, sponsor card.
- **Internal linking**: cada artículo nuevo debe recibir al menos 2 enlaces desde artículos existentes relacionados y enlazar a 2 artículos del sitio.
- **Validación final**: pasar por `/audit-schema` antes de publicar.

## Métricas de éxito (a revisar Sprint 6 de cada artículo)

- **Indexación**: en GSC en < 7 días.
- **Posición inicial**: top 30 en 2 semanas.
- **Posición consolidada**: top 10 en 6-8 semanas.
- **Clicks/mes a las 8 semanas**: ≥ 30% de la estimación recuperable.
- **Citación en AI Overview**: bonus (revisable con `aeo-strategy`).

Si una métrica falla, iterar (re-fase 2 con nuevo ángulo SERP).
