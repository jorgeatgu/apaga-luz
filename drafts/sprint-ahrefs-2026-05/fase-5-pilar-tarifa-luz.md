# Fase 5 — Pilar "tarifa luz"

[← Fase 4 — Asturias](./fase-4-asturias.md) | [← Volver a README](./README.md)

## Objetivo

Crear landing pilar para el cluster "tarifa luz" (Vol agregado 69K, top keyword `tarifa luz` con 57K vol KD 50 pos 43). Es el artículo más ambicioso del sprint — funciona como hub que enlaza al resto de artículos del cluster ya publicados.

## KPIs de éxito

- En 8-12 semanas: `tarifa luz` → pos ≤ 20.
- En 8-12 semanas: `tarifa de luz` (5.3K vol) y `tarifa de la luz` (6.1K vol) con URL ganador = el pilar (no la home).
- Aparición del pilar en AI Overviews / featured snippet para "qué es una tarifa de luz".
- 0 errores en `/audit-schema` y ≥ 5 artículos enlazando al pilar.

## Datos del cluster (Ahrefs 2026-05-14)

| Keyword | Vol | KD | CPC | Pos | URL actual |
|---|---|---|---|---|---|
| tarifa luz | 57K | 50 | 1.27 | 43 | `/` |
| tarifa de la luz | 6.1K | 34 | 1.22 | 41 | `/` |
| tarifa de luz | 5.3K | 19 | 1.22 | 18 | `/` |
| tarifas de la luz | 900 | 35 | 1.22 | 47 | `/` |
| tarifa luz.com | 500 | 47 | 1.49 | 7 | `/` |
| tarifa de luz.com | 500 | 36 | 0.97 | 11 | `/` |
| tarifa de la luz.com | 250 | 30 | 1.48 | 6 | `/` |

**Vol agregado**: 69.550 · **KD medio**: 35 · **CPC medio**: 1.27

> Aunque varias keywords ya están en top 10 con la home (`.com` variants), el pilar libera la home para queries más comerciales (compañías, ofertas) y consolida la autoridad sobre "tarifa luz" como concepto.

## Skills a usar

- **`aeo-strategy`** — pilar AEO-first: Quick Answer prominente, H2-pregunta para cada subtema, FAQ schema extenso (8-10 preguntas), HowTo schema si aplica, llms.txt friendly.
- **`seo-strategy`** — clustering, LSI (PVPC, mercado libre, peajes, comercializadora, distribuidora), prevención de canibalización con los 7 artículos del cluster ya publicados.

## Comandos a usar

- **`/audit-gsc`** — opcional, antes de empezar, para saber qué queries "tarifa luz" ya capta la home y desde dónde.
- **`/write-article tarifa luz`** — workflow completo, brief de pilar (2500-3500 palabras).
- **`/audit-schema noticias/tarifa-luz-guia-completa-2026/`** — tras crear.

## Ficheros a tocar

- **Nuevo**: `noticias/tarifa-luz-guia-completa-2026/index.html` (slug a confirmar en PROMPT 5.1).
- `index.html` (home) — link prominente al pilar.
- `noticias/guia-tipos-tarifas-electricas-2026/index.html`
- `noticias/companias-electricas-mas-baratas-2026/index.html`
- `noticias/luz-barata-2026/index.html`
- `noticias/comparador-tarifas-luz-y-gas/index.html`
- `noticias/mejor-comercializadora-pvpc/index.html`
- `vercel.json` — verificar conflictos, posibles 301 nuevos si análisis 5.1 lo recomienda (con confirmación previa del usuario).
- `public/sitemap.xml` — añadir nuevo slug.
- `llms.txt` (si existe; si no, proponer crearlo).

## PROMPT 5.1 — Análisis previo de canibalización

```
Fase 5 del sprint SEO (plan en
drafts/sprint-ahrefs-2026-05/fase-5-pilar-tarifa-luz.md).

Antes de crear el pilar "tarifa luz" necesito un análisis de canibalización. El
cluster existente tiene 7 artículos solapando:

- noticias/guia-tipos-tarifas-electricas-2026/
- noticias/companias-electricas-mas-baratas-2026/
- noticias/luz-barata-2026/
- noticias/descubre-mejores-tarifas-luz-2026/
- noticias/ofertas-luz-2026/
- noticias/comparador-tarifas-luz-y-gas/
- noticias/comparador-luz-2026-elige-la-mejor-tarifa/

Tarea:

1. Lee los 7 ficheros.
2. Para cada uno, extrae: H1, title, meta description, keyword principal aparente.
3. Identifica solapamientos exactos (≥ 70% overlap de intención).
4. Propón un mapa de territorio:
   - "tarifa luz" (pilar nuevo) → qué cubre y qué NO cubre.
   - Cada artículo existente → ángulo único que conserva.
   - Qué redirects 301 deberían añadirse a `vercel.json` si hay solape irrecuperable.

NO crees el pilar todavía. Solo el análisis + mapa.
```

## PROMPT 5.2 — Crear pilar con AEO obligatorio

```
Tras revisar el análisis de canibalización (PROMPT 5.1) y aprobar el mapa de territorio:

1. Invoca skill `aeo-strategy` para preparar la estructura AEO del pilar:
   - Quick Answer (40-60 palabras) respondiendo "¿Qué es una tarifa de luz?".
   - H2 en formato pregunta para cada subtema: ¿Qué tipos hay?, ¿Cuál es la más
     barata?, ¿PVPC o mercado libre?, ¿Cómo comparar?, ¿Cómo cambiar?
   - FAQ schema JSON-LD con 8-10 preguntas.
   - HowTo schema para "Cómo elegir tu tarifa de luz" si aplica.
   - llms.txt entry sugerida.

2. Ejecuta:

       /write-article tarifa luz

   En el brief incluye:
   - Es un pilar (longitud objetivo 2500-3500 palabras).
   - Slug propuesto: `tarifa-luz-guia-completa-2026` (confirmar con usuario).
   - Debe linkar como hub a: guia-tipos-tarifas-electricas-2026,
     companias-electricas-mas-baratas-2026, mejor-comercializadora-pvpc,
     comparador-tarifas-luz-y-gas, luz-barata-2026.
   - Diferenciador: este pilar es "qué es y cómo elegir", los otros son ranking,
     comparativa o nicho.

3. Tras crear, ejecuta:

       /audit-schema noticias/tarifa-luz-guia-completa-2026/

4. Añade enlaces recíprocos desde los 5 artículos del hub apuntando al pilar.

5. Sugiere texto para añadir al `vercel.json` si el análisis 5.1 identificó
   redirects nuevos (NO los apliques sin confirmación — pídeme aprobación).

Reporta el resultado final con diffs.
```

## PROMPT 5.3 — Validación AEO + tracking

```
Tras crear el pilar `noticias/tarifa-luz-guia-completa-2026/index.html`:

1. Invoca skill `aeo-strategy` en modo audit sobre el artículo recién creado.
   Reporta score E-E-A-T, Quick Answer fitness, FAQ coverage, AI Overview readiness.
2. Ejecuta `/audit-schema noticias/tarifa-luz-guia-completa-2026/` y confirma 0 errores.
3. Calcula la deuda de enlazado interno: lista cuántos artículos linkan al pilar
   (debería ser ≥ 5) y desde dónde.
4. Si llms.txt existe en el proyecto, añade entrada al pilar; si no, propón crearlo.

Output: checklist de done con cada item ✅ o ⚠️.
```

## Checklist de progreso

- [ ] `/audit-gsc` ejecutado (opcional, baseline de queries "tarifa luz")
- [ ] PROMPT 5.1 — análisis de canibalización ejecutado
- [ ] Mapa de territorio aprobado por mí (qué cubre el pilar vs. resto)
- [ ] Redirects 301 propuestos para `vercel.json` (si aplica) revisados y decididos
- [ ] Slug del pilar confirmado (`tarifa-luz-guia-completa-2026` u otro)
- [ ] Skill `aeo-strategy` invocado para estructura AEO
- [ ] `/write-article tarifa luz` ejecutado con brief de pilar
- [ ] Artículo creado con ≥ 2500 palabras, Quick Answer y FAQ schema 8+ preguntas
- [ ] `/audit-schema noticias/tarifa-luz-guia-completa-2026/` sin errores
- [ ] Enlaces recíprocos añadidos desde los 5 artículos del hub
- [ ] Link prominente desde home al pilar
- [ ] `vercel.json` actualizado (si análisis 5.1 lo requirió, con mi confirmación)
- [ ] Sitemap actualizado
- [ ] llms.txt actualizado (o creado si no existía)
- [ ] PROMPT 5.3 — auditoría AEO post-creación ejecutada
- [ ] Commit + push hechos
- [ ] Tracking GSC programado a 8-12 semanas (filtro query "tarifa luz")

## Verificación final

- Pilar publicado con ≥ 2500 palabras, Quick Answer prominente, FAQ schema con 8+ preguntas.
- ≥ 5 artículos del hub linkando al pilar (verificable con grep).
- `/audit-schema` pasa sin warnings.
- Mapa de territorio claro: cada artículo cubre ángulo único, sin solape > 30%.
- Auditoría AEO (PROMPT 5.3) con todos los items ✅.

---

## Post-sprint

Tras cerrar Fase 5, **esperar 4-6 semanas** y lanzar `/audit-gsc` para medir:

- Cambio de URL ganador en queries Iberdrola/Naturgy/Endesa (de `/` a artículo) — fases 1, 2, 3.
- Posición de `precio luz hoy asturias` — fase 4.
- Posición de `tarifa luz` y variantes; aparición del pilar en AI Overviews — fase 5.

Si las posiciones no mejoran, considerar segunda iteración: más enlazado interno, refrescar fechas, ampliar FAQ.

---

[← Fase 4 — Asturias](./fase-4-asturias.md) | [← Volver a README](./README.md)
