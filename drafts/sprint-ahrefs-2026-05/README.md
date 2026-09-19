# Sprint SEO Ahrefs — 2026-05-14

Sprint de 5 fases derivado de `/audit-ahrefs` sobre `~/Desktop/ahrefs-primeras-filas-ordenadas-por-cpc.txt` (50 keywords, top CPC).

## Resumen

- **Fuente**: export Ahrefs UI (copy/paste), 50 keywords del proyecto ordenadas por CPC descendente.
- **Carpeta de artículos**: `noticias/` (35 artículos al iniciar el sprint).
- **Stack**: HTML estático + Vercel, schema JSON-LD Article + FAQ + Breadcrumb.
- **Hallazgo crítico**: la home `/` canibaliza ~61K vol de keywords branded Iberdrola + Naturgy aunque existen artículos dedicados `noticias/precio-luz-iberdrola-hoy/` y `noticias/precio-luz-naturgy-hoy/`.

## Tabla de fases

| Fase | Oportunidad | Tipo | Esfuerzo | Vol | KD | Impacto | Documento |
|---|---|---|---|---|---|---|---|
| 1 | Canibalización Iberdrola | Edición | Medio | 54.5K | 22 | ★★★★★ | [fase-1-iberdrola.md](./fase-1-iberdrola.md) |
| 2 | Canibalización Naturgy | Edición | Bajo | 6.8K | 7 | ★★★★☆ | [fase-2-naturgy.md](./fase-2-naturgy.md) |
| 3 | Gap Endesa (artículo nuevo) | Creación | Medio | 600 | 4 | ★★★☆☆ | [fase-3-endesa.md](./fase-3-endesa.md) |
| 4 | Gap Asturias (artículo nuevo) | Creación | Medio | 500 | 17 | ★★★☆☆ | [fase-4-asturias.md](./fase-4-asturias.md) |
| 5 | Pilar "tarifa luz" | Creación pilar | Alto | 69K | 50 | ★★★★★ | [fase-5-pilar-tarifa-luz.md](./fase-5-pilar-tarifa-luz.md) |

## Cadencia sugerida

| Semana | Fases |
|---|---|
| Semana 1 | Fase 1 (Iberdrola) + Fase 2 (Naturgy) — comparten patrón |
| Semana 2 | Fase 3 (Endesa) + Fase 4 (Asturias) — artículos nuevos con plantilla existente |
| Semana 3 | Fase 5 (Pilar tarifa luz) — el más ambicioso, 2-3 días dedicados |
| Semana 7-8 | Tracking: `/audit-gsc` para medir impacto |

## Checklist global

- [ ] **Fase 1 — Iberdrola** (canibalización)
- [ ] **Fase 2 — Naturgy** (canibalización)
- [ ] **Fase 3 — Endesa** (artículo nuevo)
- [ ] **Fase 4 — Asturias** (artículo nuevo)
- [ ] **Fase 5 — Pilar tarifa luz** (artículo pilar + hub interno)
- [ ] **GSC** — reenvío de sitemap + solicitud de indexación de las 4 URLs del sprint
- [ ] **Post-sprint** — `/audit-gsc` a las 4-6 semanas tras fase 5

## Skills clave

| Skill | Cuándo invocar | Output esperado |
|---|---|---|
| `aeo-strategy` | Antes de escribir/editar cualquier artículo del sprint | Quick Answer (40-60 palabras), H2-pregunta, FAQ schema, entity anchoring, llms.txt |
| `seo-strategy` | Cuando hay riesgo de canibalización o sobre-optimización | Density check, LSI suggestions, cluster mapping |

## Comandos clave

| Comando | Cuándo | Fase |
|---|---|---|
| `/audit-schema noticias/{slug}/` | Antes y después de cada edición | 1, 2, 3, 4, 5 |
| `/write-article {keyword}` | Para crear artículos nuevos | 3, 4, 5 |
| `/audit-gsc` | Opcional al inicio de fase 5; obligatorio post-sprint | 5 + tracking |
| `/audit-ahrefs` | Ya ejecutado — fuente de este sprint | — |

## Reglas transversales

- **Antes de editar**: leer artículos análogos como referencia (Iberdrola es referencia para Naturgy/Endesa; Canarias para Asturias).
- **Después de editar**: ejecutar `/audit-schema` siempre.
- **Sponsor-card y CTAs**: replicar los que ya usan los artículos del proyecto (`cta-container`, `cta-heading`, `cta-text`, `cta-button`, `sponsor-card`).
- **Schema obligatorio**: Article + FAQPage + BreadcrumbList con author Organization "Apaga-luz" y publisher con logo apple-touch-icon.png.
- **Fechas en redirects**: 301 (convención existente en `vercel.json`).
- **Sin emojis** en código ni en HTML (regla del proyecto).
- **Convención de PROMPTs**: los bloques marcados como **PROMPT** en cada fase son texto literal listo para pegar al iniciar una nueva conversación de Claude Code.

## Envío a Google Search Console

> Fecha del envío: _pendiente — rellenar al ejecutar_

Tras cerrar las fases del sprint, el `public/sitemap.xml` ya refleja los nuevos `lastmod` (2026-05-14). Falta forzar el recrawl en GSC.

### Paso 1 — Reenviar sitemap

En GSC → **Sitemaps** → reenviar:

```
https://www.apaga-luz.com/sitemap.xml
```

Verificar que no aparezcan errores nuevos en el reporte.

### Paso 2 — Solicitar indexación URL por URL

En GSC → **Inspección de URL** → pegar URL → **Solicitar indexación**. Orden de prioridad:

| Orden | URL | Motivo | Fase |
|---|---|---|---|
| 1 | `https://www.apaga-luz.com/noticias/tarifa-luz-guia-completa-2026/` | Pilar nuevo (69K vol) | Fase 5 |
| 2 | `https://www.apaga-luz.com/noticias/precio-luz-endesa-hoy/` | Artículo nuevo (gap branded) | Fase 3 |
| 3 | `https://www.apaga-luz.com/noticias/precio-luz-iberdrola-hoy/` | Editado — resolución de canibalización con `/` | Fase 1 |
| 4 | `https://www.apaga-luz.com/noticias/precio-luz-naturgy-hoy/` | Editado — resolución de canibalización con `/` | Fase 2 |
| 5 | `https://www.apaga-luz.com/` | Home recrawl tras retirar contenido canibalizador Iberdrola/Naturgy | — |

### Notas operativas

- Cuota diaria de "Solicitar indexación" ~10-12 URLs/día; con 5 URLs entra de sobra.
- Para URLs editadas (3, 4, 5) el efecto del request es menor — Googlebot ya las visita con frecuencia — pero acelera la propagación del nuevo H1/Quick Answer.
- Anotar la fecha de envío arriba; `/audit-gsc` la usará como baseline para medir impacto en 4-6 semanas.

## Tracking post-sprint

A las 4-6 semanas de cerrar fase 5, ejecutar `/audit-gsc` para medir:

- Cambio de URL ganador en queries Iberdrola/Naturgy/Endesa (de `/` a artículo).
- Posición de `tarifa luz` y variantes en SERP.
- Aparición del pilar en AI Overviews / featured snippets.

Si las posiciones no mejoran, considerar segunda iteración: más enlazado interno, refrescar fechas, ampliar FAQ.

## Origen y referencias

- Reporte completo de `/audit-ahrefs` (fuente del sprint): histórico en plan file `/Users/jorgeatgu/.claude/plans/desktop-ahrefs-primeras-filas-ordenadas-warm-sky.md`.
- Datos cruzados con artículos de `noticias/` en la rama `main` al 2026-05-14.
- Redirects 2024/2025 → 2026 ya activos en `vercel.json` para cluster "compañías baratas".
