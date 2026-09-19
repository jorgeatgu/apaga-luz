# Fase 1 — Canibalización Iberdrola

[← Volver a README](./README.md) | Siguiente: [Fase 2 — Naturgy →](./fase-2-naturgy.md)

## Objetivo

Redirigir 14 keywords branded Iberdrola (Vol agregado 54.5K, score top 2694 para "precio luz hoy iberdrola" en pos 29) de la home `/` hacia `noticias/precio-luz-iberdrola-hoy/`. La home no debe rankear para queries Iberdrola; el artículo dedicado sí.

## KPIs de éxito

- En 4-6 semanas: `precio luz hoy iberdrola` (23K vol, pos 29) sube a pos ≤ 15.
- En GSC: cambio del URL ganador de `/` a `/noticias/precio-luz-iberdrola-hoy/` para queries que contengan "iberdrola".
- 0 errores en `/audit-schema noticias/precio-luz-iberdrola-hoy/`.

## Datos del cluster (Ahrefs 2026-05-14)

| Keyword | Vol | KD | CPC | Pos | URL actual |
|---|---|---|---|---|---|
| precio luz hoy iberdrola | 23K | 34 | 4.10 | 29 | `/` |
| precio de la luz hoy iberdrola | 11K | 34 | 3.51 | 46 | `/` |
| precio luz iberdrola hoy | 5.9K | 30 | 2.00 | 24 | `/` |
| iberdrola precio luz hoy | 2.8K | 34 | 1.43 | 22 | `/` |
| precio luz hoy iberdrola por horas | 2.8K | 10 | 3.62 | 12 | `/` |
| precio de la luz hoy en iberdrola | 1.6K | 33 | 4.10 | 22 | `/` |
| precio de la luz iberdrola hoy por horas | 1.4K | 17 | 4.10 | 18 | `/` |
| precio de la luz iberdrola hoy | 1.3K | 24 | 2.91 | 20 | `/` |
| luz hoy iberdrola | 1.2K | 33 | 3.17 | 27 | `/` |
| precio de la luz hoy por horas iberdrola | 1.1K | 28 | 3.92 | 14 | `/` |
| luz iberdrola hoy | 900 | 27 | 1.26 | 21 | `/` |
| horas de luz mas baratas hoy iberdrola | 700 | 16 | 4.04 | 24 | `/` |
| precio de la luz iberdrola | 500 | 8 | 1.33 | 39 | `/` |
| iberdrola precio kwh | 250 | 6 | 1.36 | 67 | `/` |

**Vol agregado**: 54.450 · **KD medio**: 22 · **CPC medio**: ~2.85

## Skills a usar

- **`aeo-strategy`** — generar Quick Answer + H2-pregunta + FAQ schema para queries Iberdrola y reforzar entity anchoring del artículo.
- **`seo-strategy`** — chequear densidad y LSI del artículo, evitar over-optimization tras añadir variantes.

## Comandos a usar

- **`/audit-schema noticias/precio-luz-iberdrola-hoy/`** — validar JSON-LD antes y después de editar.

## Ficheros a tocar

- `index.html` (home) — reducir/eliminar menciones competitivas a "Iberdrola" en H1/title/H2 principales y añadir bloque "Precio luz por compañía".
- `noticias/precio-luz-iberdrola-hoy/index.html` — reforzar Quick Answer, H2-pregunta, FAQ schema, entity anchoring.

## PROMPT 1.1 — Auditar estado actual

```
Estoy en la fase 1 de un sprint SEO sobre apaga-luz.com. El plan vive en
drafts/sprint-ahrefs-2026-05/fase-1-iberdrola.md (léelo antes de actuar).

Objetivo de esta llamada: diagnosticar por qué la home `/` canibaliza al artículo
`noticias/precio-luz-iberdrola-hoy/index.html` para 14 keywords Iberdrola
(54.5K vol agregado, top score 2694 para "precio luz hoy iberdrola" en pos 29).

Hazme un diagnóstico comparando AMBOS ficheros:

1. Lee `index.html` y `noticias/precio-luz-iberdrola-hoy/index.html`.
2. Compara: title, meta description, H1, H2s, canonical, frecuencia de "Iberdrola",
   schema JSON-LD presente, link interno entre ambos (anchor exacto).
3. Identifica POR QUÉ Google prefiere la home para queries Iberdrola.
4. Lista los cambios concretos (file:line) que harían ganar al artículo:
   - Qué reducir/eliminar en la home (referencias Iberdrola que compitan).
   - Qué reforzar en el artículo (H1 exacto, FAQ schema con variantes "hoy",
     "por horas", "kwh", H2-pregunta).
   - Anchor exacto del link interno desde la home.

NO edites todavía. Solo diagnóstico + lista de cambios propuesta.
```

## PROMPT 1.2 — Aplicar cambios + AEO

```
Aplica el diagnóstico anterior. Antes de tocar `noticias/precio-luz-iberdrola-hoy/index.html`,
invoca el skill `aeo-strategy` para asegurar que el artículo cumple:

- **Quick Answer** (40-60 palabras) tras el H1, respondiendo "¿Cuál es el precio
  de la luz Iberdrola hoy?".
- **H2 en formato pregunta** para cada variante (hoy, por horas, kWh).
- **FAQ schema** JSON-LD con 5-7 preguntas cubriendo las keywords del cluster Iberdrola
  (precio hoy, por horas, kWh, mañana, comparativa con PVPC).
- **Entity anchoring**: linkar a /about y a /noticias/mejor-comercializadora-pvpc
  para señalar autoridad.

Tras editar:
1. Ejecuta `/audit-schema noticias/precio-luz-iberdrola-hoy/` y reporta findings.
2. Reduce competencia desde la home: si `index.html` tiene H1/H2/title que mencionan
   "Iberdrola" como protagonista, suavízalos a referencia neutral con link al artículo.
3. Añade en la home un bloque "Precio luz por compañía" linkando explícitamente al
   artículo Iberdrola con anchor "Precio luz Iberdrola hoy".

Resume los diffs aplicados.
```

## Checklist de progreso

- [ ] Diagnóstico ejecutado (PROMPT 1.1)
- [ ] Lista de cambios concretos aprobada por mí
- [ ] Skill `aeo-strategy` invocado para Quick Answer + FAQ schema
- [ ] Cambios aplicados al artículo `noticias/precio-luz-iberdrola-hoy/index.html`
- [ ] Cambios aplicados a `index.html` (reducir Iberdrola + bloque "Precio luz por compañía")
- [ ] `/audit-schema noticias/precio-luz-iberdrola-hoy/` sin errores
- [ ] Anchor "Precio luz Iberdrola hoy" linkando desde home verificado
- [ ] Commit + push hechos
- [ ] Tracking GSC programado a 4 semanas (filtro query "iberdrola")

## Verificación final

- `/audit-schema noticias/precio-luz-iberdrola-hoy/` pasa (Article + FAQ + Breadcrumb, 0 errores).
- A 4 semanas: `site:apaga-luz.com precio luz iberdrola` en Google muestra el artículo, no la home.
- GSC: para queries que contengan "iberdrola", el URL principal pasa de `/` al artículo.

---

[← Volver a README](./README.md) | Siguiente: [Fase 2 — Naturgy →](./fase-2-naturgy.md)
