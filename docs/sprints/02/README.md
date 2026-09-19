# Sprint 02 — Cierre de flecos, INP de la home y refrescos fuera del sprint 01

## Visión

Nace de la revisión del 19 de septiembre de 2026 del Sprint 01 frente al informe `drafts/informe-seo-2026-09/README.md` (plan en `~/.claude/plans/buenas-ya-hemos-terminado-cosmic-llama.md`). Las acciones 1-8 del informe están desplegadas y verificadas en producción; la 9 (INP) no se empezó.

Regla del sprint: **no tocar las páginas del Sprint 01** (home, `/precio-luz-manana/`, los cinco artículos "hoy", Energía XXI, los dos de indexación) hasta el seguimiento del 30 de octubre. Google tarda 2-6 semanas en reflejar los títulos y el INP de campo es un p75 de 28 días; cualquier cambio contamina la medición. Este sprint va a lo ortogonal.

## Fases

| # | Fase | Esfuerzo | Estado |
|---|---|---|---|
| 1 | Flecos del Sprint 01: checklists marcados, empate de hora mínima unificado con el plugin (`main.js` `calculatePriceStats`), sesiones GA4 del 19-20 sep anotadas en `docs/sprints/01/retro.md`, `docs/` y `drafts/` commiteados | 2-3 h | Checklists y hora mínima hechos el 19 sep; falta GA4 (procesamiento 24-48 h) y el commit |
| 2 | Sprint INP de la home según `drafts/INP_AUDIT_HANDOFF.md`. Primer paso: resolver `drop_console` para ver la atribución en producción (exceptuar `web-vitals.js` o enviar la atribución como evento GA4). Después medir con Claude para Chrome en móvil con throttling y decidir sobre vignette | 1-2 días | Pendiente |
| 3 | Refresh `noticias/mejor-comercializadora-pvpc/`: title, og:title y twitter:title dicen "Ranking 2025"; fecha visible mar 2025; cifras "En 2025…"; related-post "Precios 2025". Sin fecha dinámica (fuera del patrón "hoy"), sí año 2026 y `dateModified` | ½ día | Pendiente |
| 4 | `/graficas/`: title con dato del día vía plugin, Quick Answer, Dataset schema, H2-pregunta. Sustituye al artículo "evolución histórico" descartado en la acción 8 | ½ día | Pendiente |
| 5 | Ahrefs > Backlinks rotos: listar URLs antiguas con enlaces (histórico 1.200 dominios, hoy 574) y añadir 301 en `vercel.json` | 1-2 h | Pendiente |
| 6 | Refresh `noticias/tarifas-placas-solares/` (perdió el 97 % de clics, 388 → 9). Solo tras el 30 oct | ½ día | Aplazado |

## Fuera de alcance

Artículos nuevos (kWh España, autoconsumo, Asturias, Canarias, catalán): el blog completo hace 185 clics/trimestre. Segunda descanibalización home/Iberdrola: esperar al dato de Ahrefs del 30 oct. Cabecera `X-GitHub-Api-Version` de cron-job.org: hasta 2028.

## Principios

Los del Sprint 01 (`docs/sprints/01/README.md`): rama por fase, `/code-review` antes de la PR, schema Article + FAQPage + BreadcrumbList validado con `/audit-schema`, PSI móvil antes/después **en la misma sesión** (lección de la retro 01).

## Definición de hecho

- Fases 1-5 mergeadas; la 6 decidida el 30 oct.
- Home: consola de producción muestra la atribución INP; decisión sobre Auto Ads documentada con datos.
- `mejor-comercializadora-pvpc` y `/graficas/` sin "2025" en title/meta y con 0 errores en resultados enriquecidos.
- 30 oct: export GSC + `/audit-gsc` contra `drafts/informe-seo-2026-09/datos/`.
