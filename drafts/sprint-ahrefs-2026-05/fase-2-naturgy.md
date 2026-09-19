# Fase 2 — Canibalización Naturgy

[← Fase 1 — Iberdrola](./fase-1-iberdrola.md) | [← Volver a README](./README.md) | Siguiente: [Fase 3 — Endesa →](./fase-3-endesa.md)

## Objetivo

Replicar el patrón de la Fase 1 (Iberdrola) para Naturgy: redirigir 5 keywords branded (Vol agregado 6.8K, **KD muy bajos 3-9**) de la home `/` hacia `noticias/precio-luz-naturgy-hoy/`. Esfuerzo bajo, ROI rápido por los KD reducidos.

## KPIs de éxito

- En 4 semanas: `precio luz naturgy` (2.1K vol, KD 3, pos 37) → pos ≤ 10.
- En 4 semanas: `precio luz naturgy hoy` (2.2K vol, KD 9, pos 23) → pos ≤ 10.
- En GSC: cambio del URL ganador de `/` a `/noticias/precio-luz-naturgy-hoy/` para queries que contengan "naturgy".
- 0 errores en `/audit-schema noticias/precio-luz-naturgy-hoy/`.

## Datos del cluster (Ahrefs 2026-05-14)

| Keyword | Vol | KD | CPC | Pos | URL actual |
|---|---|---|---|---|---|
| precio luz naturgy hoy | 2.2K | 9 | 1.00 | 23 | `/` |
| precio luz naturgy | 2.1K | 3 | 1.37 | 37 | `/` |
| precio de la luz hoy naturgy | 1.1K | 8 | 1.67 | 14 | `/` |
| precio luz hoy naturgy | 900 | 7 | 1.66 | 15 | `/` |
| precio de la luz hoy por horas naturgy | 500 | 7 | 1.60 | 14 | `/` |

**Vol agregado**: 6.800 · **KD medio**: 7 · **CPC medio**: ~1.46

> KDs 3-9 son una victoria fácil si el artículo está bien estructurado y la home le cede protagonismo. Es la fase con mejor ratio impacto/esfuerzo del sprint.

## Skills a usar

- **`aeo-strategy`** — Quick Answer + FAQ schema con variantes Naturgy (hoy, por horas, comparativa).

## Comandos a usar

- **`/audit-schema noticias/precio-luz-naturgy-hoy/`** — antes y después.

## Ficheros a tocar

- `index.html` (home) — añadir Naturgy al bloque "Precio luz por compañía" creado en la Fase 1.
- `noticias/precio-luz-naturgy-hoy/index.html` — reforzar siguiendo el patrón del artículo Iberdrola tras la Fase 1.

## PROMPT 2.1 — Replicar patrón Iberdrola

```
Estoy en la fase 2 del sprint SEO (plan en
drafts/sprint-ahrefs-2026-05/fase-2-naturgy.md).

La fase 1 (Iberdrola) ya está hecha. Replica el MISMO patrón sobre el artículo
`noticias/precio-luz-naturgy-hoy/index.html` y la home, para las 5 keywords Naturgy:
- precio luz naturgy hoy (2.2K vol, KD 9)
- precio luz naturgy (2.1K vol, KD 3)
- precio de la luz hoy naturgy (1.1K vol, KD 8)
- precio luz hoy naturgy (900 vol, KD 7)
- precio de la luz hoy por horas naturgy (500 vol, KD 7)

Pasos:

1. Diff con `noticias/precio-luz-iberdrola-hoy/index.html` (de la fase 1) para
   reusar estructura: Quick Answer, H1, FAQ schema, anchor desde home.
2. Invoca skill `aeo-strategy` para validar Quick Answer (40-60 palabras
   respondiendo "¿Cuál es el precio de la luz Naturgy hoy?") + H2-pregunta + FAQ
   con 5-7 preguntas cubriendo el cluster.
3. Aplica los cambios al artículo Naturgy y al bloque "Precio luz por compañía"
   de la home (añade Naturgy junto a Iberdrola).
4. Ejecuta `/audit-schema noticias/precio-luz-naturgy-hoy/` y reporta.

Aprovecha que los KD son 3-9 — es una victoria fácil si el artículo está bien
estructurado y la home le cede protagonismo.
```

## Checklist de progreso

- [ ] Confirmado que la Fase 1 ha cerrado y dejó el bloque "Precio luz por compañía" en home
- [ ] Diff de referencia ejecutado vs. `noticias/precio-luz-iberdrola-hoy/index.html`
- [ ] Skill `aeo-strategy` invocado para Quick Answer + FAQ Naturgy
- [ ] Cambios aplicados al artículo `noticias/precio-luz-naturgy-hoy/index.html`
- [ ] Naturgy añadida al bloque "Precio luz por compañía" en home con anchor "Precio luz Naturgy hoy"
- [ ] `/audit-schema noticias/precio-luz-naturgy-hoy/` sin errores
- [ ] Commit + push hechos
- [ ] Tracking GSC programado a 4 semanas (filtro query "naturgy")

## Verificación final

- `/audit-schema` pasa.
- Bloque "Precio luz por compañía" en home con dos anchors: Iberdrola y Naturgy (placeholder para Endesa cuando termine Fase 3).
- A 4 semanas: posiciones top 10 para `precio luz naturgy` y `precio luz naturgy hoy`.

---

[← Fase 1 — Iberdrola](./fase-1-iberdrola.md) | [← Volver a README](./README.md) | Siguiente: [Fase 3 — Endesa →](./fase-3-endesa.md)
