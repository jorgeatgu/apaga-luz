# Fase 3 — Crear artículo Endesa (gap)

[← Fase 2 — Naturgy](./fase-2-naturgy.md) | [← Volver a README](./README.md) | Siguiente: [Fase 4 — Asturias →](./fase-4-asturias.md)

## Objetivo

Cerrar el trío Iberdrola/Naturgy/Endesa. Crear `noticias/precio-luz-endesa-hoy/index.html` para capturar `precio luz hoy gratis endesa` (600 vol, **KD 4**, pos 17 con home rankeando ahora mismo).

## KPIs de éxito

- En 4-6 semanas tras indexación: `precio luz hoy gratis endesa` → pos ≤ 10.
- Aparición del artículo en GSC para queries que contengan "endesa".
- 0 errores en `/audit-schema noticias/precio-luz-endesa-hoy/`.

## Datos del cluster (Ahrefs 2026-05-14)

| Keyword | Vol | KD | CPC | Pos | URL actual |
|---|---|---|---|---|---|
| precio luz hoy gratis endesa | 600 | 4 | 0.95 | 17 | `/` (home, sin artículo dedicado) |

**Vol agregado**: 600 · **KD**: 4 · **CPC**: 0.95

> KD 4 con la home ya en pos 17 → un artículo dedicado tiene altísima probabilidad de subir al top 10. Además completa el trío Iberdrola/Naturgy/Endesa, lo que abre la puerta a un hub "Precio luz por compañía" en home (escalable a Repsol, TotalEnergies, Holaluz…).

## Skills a usar

- **`aeo-strategy`** — obligatorio dentro de `/write-article` (Quick Answer + H2-pregunta + FAQ schema).
- **`seo-strategy`** — densidad y LSI (peajes, comercializadora, distribuidora E-DISTRIBUCIÓN filial Endesa, contadores, bono social).

## Comandos a usar

- **`/write-article precio luz endesa hoy`** — workflow 7 fases con AEO obligatorio.
- **`/audit-schema noticias/precio-luz-endesa-hoy/`** — tras crear.

## Ficheros a tocar

- **Nuevo**: `noticias/precio-luz-endesa-hoy/index.html`.
- `index.html` (home) — añadir Endesa al bloque "Precio luz por compañía" (creado en Fase 1, ampliado en Fase 2).
- `vercel.json` — verificar que no hay redirect previo a Endesa que pueda colisionar.
- `public/sitemap.xml` (o equivalente) — añadir nuevo slug si es manual.
- `noticias/precio-luz-iberdrola-hoy/index.html`, `noticias/precio-luz-naturgy-hoy/index.html` — añadir enlace recíproco al artículo Endesa en una sección "Comparativa con otras compañías".

## PROMPT 3.1 — Crear artículo

```
Fase 3 del sprint SEO (plan en
drafts/sprint-ahrefs-2026-05/fase-3-endesa.md).

Vamos a crear el artículo Endesa para cerrar el trío Iberdrola/Naturgy/Endesa.

Antes de lanzar `/write-article`:

1. Lee `noticias/precio-luz-iberdrola-hoy/index.html` (referencia estructura
   tras fase 1).
2. Lee `noticias/precio-luz-naturgy-hoy/index.html` (referencia tras fase 2).
3. Confirma layout, schemas, secciones y sponsor-card a replicar.

Después ejecuta:

    /write-article precio luz endesa hoy

Cuando termine:
- Verifica que se creó en `noticias/precio-luz-endesa-hoy/index.html`.
- Confirma que el slug es coherente con el patrón del trío.
- Confirma cobertura de keywords: "precio luz hoy gratis endesa" (600 vol, KD 4),
  variantes ("precio endesa hoy", "tarifa endesa", "endesa por horas").

Tras crear, ejecuta:

    /audit-schema noticias/precio-luz-endesa-hoy/

Reporta findings.
```

## PROMPT 3.2 — Integración con home y enlace interno

```
Tras crear `noticias/precio-luz-endesa-hoy/index.html`:

1. Añade Endesa al bloque "Precio luz por compañía" de `index.html` (junto a
   Iberdrola y Naturgy de fases 1 y 2). Anchor exacto: "Precio luz Endesa hoy".
2. Añade enlaces internos recíprocos entre los tres artículos del trío
   (Iberdrola ↔ Naturgy ↔ Endesa) en una sección "Comparativa con otras compañías".
3. Verifica que `vercel.json` no tiene un redirect previo para
   `/noticias/precio-luz-endesa-hoy/` que pueda colisionar.
4. Comprueba que el sitemap (`public/sitemap.xml` o equivalente) incluye el nuevo
   slug. Si es estático y manual, añádelo.

Resume cambios y muéstrame el diff de `index.html` y `vercel.json` (si tocaste algo).
```

## Checklist de progreso

- [ ] Leídos los artículos referencia (Iberdrola + Naturgy tras Fases 1 y 2)
- [ ] `/write-article precio luz endesa hoy` ejecutado
- [ ] Artículo creado en `noticias/precio-luz-endesa-hoy/index.html`
- [ ] Slug verificado (coherente con `precio-luz-{compañia}-hoy`)
- [ ] Cobertura de keywords confirmada (gratis endesa + variantes)
- [ ] `/audit-schema noticias/precio-luz-endesa-hoy/` sin errores
- [ ] Endesa añadida al bloque "Precio luz por compañía" en home
- [ ] Enlaces recíprocos Iberdrola ↔ Naturgy ↔ Endesa añadidos
- [ ] `vercel.json` verificado (sin colisión)
- [ ] Sitemap actualizado
- [ ] Commit + push hechos
- [ ] Tracking GSC programado a 4-6 semanas (filtro query "endesa")

## Verificación final

- Artículo accesible en `/noticias/precio-luz-endesa-hoy/` (200 OK, no 404 ni redirect).
- `/audit-schema` pasa sin warnings.
- Trío Iberdrola/Naturgy/Endesa visible en home con anchors descriptivos.
- Sitemap incluye el nuevo slug.
- Enlaces internos recíprocos del trío funcionando.

---

[← Fase 2 — Naturgy](./fase-2-naturgy.md) | [← Volver a README](./README.md) | Siguiente: [Fase 4 — Asturias →](./fase-4-asturias.md)
