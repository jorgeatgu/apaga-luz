# Fase 6 — Artículos "precio luz hoy": CTR con dato del día y franjas 2026

## Objetivo

Subir el CTR de los cinco artículos que ya aparecen en primera o segunda página con clics residuales, poniendo el día de la semana y el dato del día en title, H1 y Quick Answer, y corrigiendo el "2025" del artículo de franjas horarias.

## Dependencias

Fase 3 mergeada. Paralela a las fases 4 y 5. La fase 7 clona el artículo de Endesa **después** de esta fase, así que depende de ella.

## Lo que hay hoy

| Artículo | Clics / impr / pos (3 meses) | Consultas con CTR ~0 |
|---|---|---|
| `noticias/precio-luz-iberdrola-hoy/` (title: "Precio Luz Hoy Iberdrola: Tarifa PVPC en Tiempo Real \| Apaga Luz") | 33 / 16.646 / 7,7 | "precio luz hoy iberdrola por horas" 3.165 impr / 6 clics; "a que hora es más barata la luz iberdrola hoy" 2.262 / 5; "precio luz hoy iberdrola" 692 / 1 |
| `noticias/precio-luz-naturgy-hoy/` | 1 / 1.191 / 23,3 | "precio luz naturgy hoy" 1.086 / 3 (pos 9,1, era 69); "precio luz hoy naturgy por horas" 1.063 / 3 |
| `noticias/precio-luz-endesa-hoy/` | 7 / 1.675 / 13,1 | — |
| `noticias/pvpc-precio-hoy-tarifa-regulada/` | 8 / 2.955 / 17,5 | "pvpc hoy" 9,2K vol pos 17 (Ahrefs, con la home) |
| `noticias/franjas-horarias-luz-hoy/` (title: "Franjas Horarias Luz Hoy \| Guía para mejorar tu Ahorro 2025"; H1 con "2025") | 56 / 19.140 / 2,3 | Posición 2 con CTR 0,3 %: patrón de cita en AI Overview |

- Los tres artículos de compañía comparten estructura (Iberdrola fue la plantilla en mayo): head con schemas Article + FAQPage + BreadcrumbList, `post-title`, `post-text-date`, Quick Answer, tabla, CTA `cta-container`, `sponsor-card`.
- Ninguno lee `today_price.json` en el HTML estático; algunos lo pintan en runtime.
- Datos de hoy: `public/data/today_price.json` (formato en fase 3).

## Decisiones cerradas

| Tema | Decisión |
|---|---|
| Title compañías | "Precio luz hoy {Compañía}, {diaSemana} {día} de {mes}: hora más barata y tabla por horas" (fallback sin fecha) |
| H1 | Igual sin cola de marca |
| Quick Answer | 40-60 palabras con precio medio, hora más barata y más cara de hoy, y una frase que sitúe a la compañía (PVPC vía su COR o mercado libre) |
| H2-pregunta | "¿A qué hora es más barata la luz hoy con {Compañía}?" como primer H2 |
| PVPC | Mismo patrón con "Precio PVPC hoy, {fecha}: …" |
| Franjas horarias | Todas las referencias a 2025 pasan a 2026; title reorientado a la intención "franjas horarias luz hoy" con las horas de valle, llano y punta de hoy (fijas por tarifa 2.0TD: valle 00-08 y fines de semana, llano 08-10/14-18/22-24, punta 10-14/18-22) y el precio medio de cada franja calculado desde `today_price.json` si el plugin lo expone; si no, precio medio del día |
| `dateModified` | Se actualiza en los cinco artículos al día del merge |

## Alcance

1. Baseline PSI móvil de `precio-luz-iberdrola-hoy` y `/audit-schema` de los cinco artículos, anotados aquí.
2. Title, meta description, H1 y Quick Answer con placeholders en los cuatro artículos de compañía/PVPC.
3. Primer H2 en forma de pregunta con la compañía.
4. Franjas horarias: sustituir 2025 por 2026, reescribir title/H1/meta, añadir el precio medio por franja (placeholder o texto estático si el plugin no lo expone; en ese caso anotar en la fase 3 la extensión pendiente).
5. `dateModified` actualizado en los cinco.
6. Build y comprobación de fecha en los cinco `build/noticias/*/index.html`.
7. `/audit-schema` después en los cinco.

## Fuera de alcance

Contenido nuevo más allá del Quick Answer y el H2. Cambios en tablas pintadas por JS. El artículo de Energía XXI (fase 7). Enlaces desde la home (fase 5 los deja como anchors exactos).

## Tareas

- [x] Rama `fase-6-articulos-hoy`
- [ ] Baseline PSI (Iberdrola) y `/audit-schema` de los cinco anotados
- [x] Iberdrola: title, meta, H1, Quick Answer, H2-pregunta, dateModified
- [x] Naturgy: ídem
- [x] Endesa: ídem
- [x] PVPC: ídem
- [x] Franjas horarias: 2025 → 2026, title/H1/meta, precio por franja, dateModified
- [x] Build y comprobación de fecha en los cinco
- [x] `/audit-schema` después sin errores en los cinco
- [x] PSI móvil de Iberdrola después: INP no empeora
- [x] Tests, lint y format en verde
- [x] PR

_Nota (19 sep 2026): el baseline PSI de esta fase no se anotó; la comparación se hizo en la fase 9 contra un despliegue anterior (ver `retro.md`). Ningún INP cambió de bucket._

## Criterios de aceptación

- `for f in precio-luz-iberdrola-hoy precio-luz-naturgy-hoy precio-luz-endesa-hoy pvpc-precio-hoy-tarifa-regulada; do grep -o "<title>[^<]*" build/noticias/$f/index.html; done` muestra el día de la semana y la fecha en los cuatro.
- `grep -c "2025" noticias/franjas-horarias-luz-hoy/index.html` = 0 salvo en `datePublished`.
- Cada Quick Answer del build tiene 40-60 palabras y dos precios en €/kWh.
- `grep -c '"dateModified": "2026-' noticias/{precio-luz-iberdrola-hoy,precio-luz-naturgy-hoy,precio-luz-endesa-hoy,pvpc-precio-hoy-tarifa-regulada,franjas-horarias-luz-hoy}/index.html` = 1 en cada uno con la fecha del merge.
- `/audit-schema` sin errores en los cinco.
- PSI móvil de Iberdrola: INP en el mismo bucket o mejor.

## Registro de ejecución (18 sep 2026)

### Baseline
- `/audit-schema` antes: 0 errores en los cinco. Article + BreadcrumbList + FAQPage en todos; HowTo en los tres de compañía; DefinedTerm en PVPC. Avisos: `publisher` sin `url` (patrón de todo el sitio), description de Iberdrola 161 car. y de PVPC 138.
- PSI móvil Iberdrola antes: _pendiente_

### Después
- Plugin extendido con `esLaborable`, `precioValle`, `precioLlano`, `precioPunta` (anotado en fase 3). 27 tests en verde.
- Build del 18 sep: titles con "viernes 18 de septiembre" en los cinco; Quick Answer de 54-57 palabras con 3 precios en los cuatro de compañía/PVPC; franjas 57 palabras con precio de las tres franjas (en fin de semana/festivo, un solo precio: todo es valle).
- `grep -c 2025` en franjas = 1 (`datePublished`). Tarjetas relacionadas con "2025" sustituidas por PVPC hoy e Iberdrola hoy; fecha del ranking corregida.
- `/audit-schema` después: 0 errores; solo el aviso `publisher` sin `url`.
- `sitemap.xml`: `lastmod` 2026-09-18 en los cinco.
- PSI móvil Iberdrola después: _pendiente_

## Skills recomendados

- `aeo-strategy`: Quick Answer y H2-pregunta.
- `seo-analysis-monitoring:seo-content-refresher` (agente): para localizar fechas, cifras y ejemplos caducos en franjas-horarias y en los artículos de compañía.
- `seo-technical-optimization:seo-meta-optimizer` (agente): titles dentro de 60 caracteres cuando la fecha los alarga.
- `/audit-schema`, `performance-benchmarker`.
- `/code-review` antes de la PR; `/create-commit` y `/create-pr`.

## PROMPT

```
Vamos a ejecutar la Fase 6 del Sprint 01 de "apaga-luz". Lee docs/sprints/01/README.md y docs/sprints/01/fase-6-articulos-hoy.md. Antes de escribir nada, lee enteros: noticias/precio-luz-iberdrola-hoy/index.html (plantilla de los tres de compañía), noticias/franjas-horarias-luz-hoy/index.html, la cabecera de scripts/vite-plugin-daily-data.mjs (contrato de placeholders) y drafts/informe-seo-2026-09/05-ctr-articulos-hoy.md. Las decisiones están cerradas y no se re-preguntan: title/H1 con compañía + día de la semana + fecha, Quick Answer con precio medio y horas más barata/cara de hoy, primer H2 en forma de pregunta con la compañía, franjas horarias sin ninguna referencia a 2025 y con precio medio por franja, dateModified actualizado. Orden: baseline, Iberdrola primero (sirve de molde), después Naturgy, Endesa y PVPC, después franjas, build, /audit-schema. Yo lanzo a mano PageSpeed Insights y te paso los valores. Crea la rama fase-6-articulos-hoy y ejecuta el alcance completo. Antes de abrir la PR, lanza /code-review y atiende sus hallazgos.
```
