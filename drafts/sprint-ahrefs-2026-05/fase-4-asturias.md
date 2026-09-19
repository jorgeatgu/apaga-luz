# Fase 4 — Crear artículo Asturias (gap local)

[← Fase 3 — Endesa](./fase-3-endesa.md) | [← Volver a README](./README.md) | Siguiente: [Fase 5 — Pilar tarifa luz →](./fase-5-pilar-tarifa-luz.md)

## Objetivo

Replicar el patrón Canarias para Asturias. Crear `noticias/precio-luz-asturias-hoy/index.html` para capturar `precio luz hoy asturias` (500 vol, KD 17, pos 38 con home). Establece plantilla replicable para futuras provincias.

## KPIs de éxito

- En 6-8 semanas: `precio luz hoy asturias` → pos ≤ 15.
- Plantilla local probada y replicable (Galicia, País Vasco, Cataluña…).
- 0 errores en `/audit-schema noticias/precio-luz-asturias-hoy/`.

## Datos del cluster (Ahrefs 2026-05-14)

| Keyword | Vol | KD | CPC | Pos | URL actual |
|---|---|---|---|---|---|
| precio luz hoy asturias | 500 | 17 | 1.71 | 38 | `/` (sin artículo dedicado) |

**Vol agregado**: 500 · **KD**: 17 · **CPC**: 1.71

> El cluster local tiene también keywords Canarias (ya cubiertas por `noticias/precio-luz-canarias-hoy/`). Asturias es el siguiente gap natural. Si Asturias funciona, se abre la puerta a un bloque "Precio luz por comunidad" en home (semilla para escalar).

## Skills a usar

- **`aeo-strategy`** — obligatorio dentro de `/write-article` (Quick Answer + H2-pregunta + FAQ schema).
- **`seo-strategy`** — LSI local: provincia, comunidad autónoma, distribuidora, peajes ATR, especificidades climáticas.

## Comandos a usar

- **`/write-article precio luz hoy asturias`** — workflow 7 fases con AEO + reglas locales.
- **`/audit-schema noticias/precio-luz-asturias-hoy/`** — tras crear.

## Ficheros a tocar

- **Nuevo**: `noticias/precio-luz-asturias-hoy/index.html`.
- `noticias/precio-luz-canarias-hoy/index.html` — usar como template (no se edita).
- `index.html` (home) — preguntar al usuario si añadir bloque "Precio luz por comunidad" (Canarias + Asturias) como semilla.
- `public/sitemap.xml` — añadir nuevo slug si manual.

## PROMPT 4.1 — Crear con plantilla local

```
Fase 4 del sprint SEO (plan en
drafts/sprint-ahrefs-2026-05/fase-4-asturias.md).

Objetivo: crear `noticias/precio-luz-asturias-hoy/index.html` siguiendo el patrón
de `noticias/precio-luz-canarias-hoy/index.html`.

Pasos:

1. Lee `noticias/precio-luz-canarias-hoy/index.html` y detecta el patrón usado:
   schemas, H2s, mención a distribuidora regional, datos específicos, FAQs.
2. Ejecuta:

       /write-article precio luz hoy asturias

   En el brief, indica explícitamente:
   - Replicar la plantilla de Canarias.
   - Mencionar particularidades de Asturias: distribuidora E-DISTRIBUCIÓN (Endesa
     filial) o EDP HC Energía como referencia, peajes ATR, especificidades de
     consumo en clima atlántico.
   - Diferenciador frente al artículo Canarias: Canarias tiene PVPC diferente al
     peninsular, Asturias no — clarificarlo en el artículo.

3. Cuando termine, ejecuta:

       /audit-schema noticias/precio-luz-asturias-hoy/

4. Pregunta al usuario si quiere que añadamos un bloque "Precio luz por comunidad"
   en la home agrupando Canarias + Asturias (semilla para escalar a más provincias).

Reporta cambios y findings de schema.
```

## Checklist de progreso

- [ ] Leído `noticias/precio-luz-canarias-hoy/index.html` como referencia
- [ ] Patrón detectado (schemas, H2s, distribuidora local, FAQs)
- [ ] `/write-article precio luz hoy asturias` ejecutado con brief local
- [ ] Artículo creado en `noticias/precio-luz-asturias-hoy/index.html`
- [ ] Diferenciador con Canarias documentado (PVPC peninsular vs no peninsular)
- [ ] Mención de distribuidora E-DISTRIBUCIÓN o EDP HC Energía incluida
- [ ] `/audit-schema noticias/precio-luz-asturias-hoy/` sin errores
- [ ] Decisión tomada sobre bloque "Precio luz por comunidad" en home
- [ ] Sitemap actualizado
- [ ] Commit + push hechos
- [ ] Tracking GSC programado a 6-8 semanas (filtro query "asturias")

## Verificación final

- Artículo creado con datos locales reales (distribuidora regional, peajes ATR).
- `/audit-schema` pasa sin warnings.
- Diferenciación clara con Canarias (no canibalización local).
- Plantilla validada y replicable para próximas provincias.

---

[← Fase 3 — Endesa](./fase-3-endesa.md) | [← Volver a README](./README.md) | Siguiente: [Fase 5 — Pilar tarifa luz →](./fase-5-pilar-tarifa-luz.md)
