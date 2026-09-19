# Sprint 02 — Cierre de flecos, INP de la home y refrescos fuera del sprint 01

## Visión

Nace de la revisión del 19 de septiembre de 2026 del Sprint 01 frente al informe `drafts/informe-seo-2026-09/README.md` (plan en `~/.claude/plans/buenas-ya-hemos-terminado-cosmic-llama.md`). Las acciones 1-8 del informe están desplegadas y verificadas en producción; la 9 (INP) no se empezó.

Regla del sprint: **no tocar las páginas del Sprint 01** (home, `/precio-luz-manana/`, los cinco artículos "hoy", Energía XXI, los dos de indexación) hasta el seguimiento del 30 de octubre. Google tarda 2-6 semanas en reflejar los títulos y el INP de campo es un p75 de 28 días; cualquier cambio contamina la medición. Este sprint va a lo ortogonal.

## Decisiones cerradas (19 sep 2026)

- Home: el Quick Answer se queda bajo el H1; el párrafo "Apaga Luz te muestra…" baja debajo de la tabla. El texto "Aprende Economía Global" que aparecía pegado no está en el repo: es un anuncio de Auto Ads; se separa con margen.
- Aviso de precios de mañana: en todas las páginas, flotante, decidido por el dato (qué JSON contiene mañana), no por la hora. OMIE = provisional, ESIOS = definitivo.
- AdSense: el usuario toca el panel (vignette, carga de anuncios) si la medición de INP señala a los anuncios.
- Flecos previos cerrados antes del sprint: checklists del 01 marcados, empate de hora mínima corregido en `main.js`, `docs/` y `drafts/` commiteados. Pendiente: sesiones GA4 del 19-20 sep en la retro 01 y QA en móvil real.

## Fases

| # | Fase | Rama | Esfuerzo | Estado |
|---|---|---|---|---|
| 1 | Aviso flotante de precios de mañana (`source/javascript/tomorrow-notice.js`, importado desde las 6 entradas JS + script en `tipos-tarifas-electricas`) y home aligerada | `fase-1-aviso-manana` | ½ día | Hecho 19 sep |
| 2 | Refresh `noticias/mejor-comercializadora-pvpc/`: "Ranking 2025" → 2026 en title/og/twitter, fechas, peajes, related posts; Quick Answer y FAQ visible que respalde el FAQPage | `fase-2-mejor-comercializadora` | ½ día | Pendiente |
| 3 | `/graficas/`: title y H1 con dato del día vía plugin, Quick Answer, H2-pregunta, Speakable, enlaces internos | `fase-3-graficas` | ½ día | Pendiente |
| 4 | Ahrefs > Backlinks rotos → 301 en `vercel.json` | `fase-4-backlinks` | 1-2 h | Pendiente |
| 5 | INP de la home según `drafts/INP_AUDIT_HANDOFF.md`: medir en producción con Chrome (móvil, CPU 4×), atribuir, decidir AdSense vs JS propio | `fase-5-inp` | 1-2 días + 7 de espera | Pendiente |
| 6 | Refresh `noticias/tarifas-placas-solares/` (perdió el 97 % de clics). Solo tras el 30 oct | — | ½ día | Aplazado |

Detectado en la fase 1: `tipos-tarifas-electricas/` tiene "[2025]" en el title. Candidato a refresh junto a la fase 2.

## Fuera de alcance

Artículos nuevos (kWh España, autoconsumo, Asturias, Canarias, catalán): el blog completo hace 185 clics/trimestre. Segunda descanibalización home/Iberdrola: esperar al dato de Ahrefs del 30 oct. Cabecera `X-GitHub-Api-Version` de cron-job.org: hasta 2028.

## Principios

Los del Sprint 01 (`docs/sprints/01/README.md`): rama por fase, `/code-review` antes de la PR, schema Article + FAQPage + BreadcrumbList validado con `/audit-schema`, PSI móvil antes/después **en la misma sesión** (lección de la retro 01).

## Definición de hecho

- Fases 1-5 mergeadas; la 6 decidida el 30 oct.
- Home: consola de producción muestra la atribución INP; decisión sobre Auto Ads documentada con datos.
- `mejor-comercializadora-pvpc` y `/graficas/` sin "2025" en title/meta y con 0 errores en resultados enriquecidos.
- 30 oct: export GSC + `/audit-gsc` contra `drafts/informe-seo-2026-09/datos/`.
