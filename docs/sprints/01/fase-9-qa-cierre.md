# Fase 9 — QA, Search Console y cierre

## Objetivo

Comprobar en producción que todo lo del sprint está desplegado y correcto, forzar el recrawl en Search Console, fijar el baseline para medir a las 6 semanas y escribir la retrospectiva.

## Dependencias

Todas las anteriores mergeadas y desplegadas en producción. Sin PR de código salvo correcciones menores que salgan del QA.

## Lo que hay hoy

- Baseline del informe (18 sep 2026), en `drafts/informe-seo-2026-09/README.md` y `datos/`: clics 34,4K / impr 421K / CTR 8,2 % / pos 17,6 (3 meses); serie mensual en `gsc-monthly-16m.csv`; GA4 sin datos desde junio.
- Procedimiento de GSC ya usado en mayo (`drafts/sprint-ahrefs-2026-05/README.md`, sección "Envío a Google Search Console"): reenviar `https://www.apaga-luz.com/sitemap.xml` y solicitar indexación URL a URL (cuota ~10-12/día).
- Herramientas: PageSpeed Insights (INP móvil), prueba de resultados enriquecidos de Google (schemas), `curl -sI` (redirects), GSC Inspección de URL (HTML renderizado que ve Google, útil para confirmar que el title lleva la fecha).
- Métricas objetivo a 6 semanas (informe, sección "Métricas de seguimiento"): cluster "mañana" pos < 7 y CTR > 3 %; "precio de la luz hoy" CTR > 1 %; URL ganadora en Ahrefs para "precio luz hoy iberdrola" = artículo; impresiones de octubre ≥ 150K; GA4 ≈ 1,3-1,5 × clics GSC.

## Decisiones cerradas

| Tema | Decisión |
|---|---|
| Orden de solicitud de indexación | 1 `/precio-luz-manana/`, 2 `/`, 3 `precio-luz-energia-xxi-hoy`, 4 `precio-luz-iberdrola-hoy`, 5 `precio-luz-naturgy-hoy`, 6 `precio-luz-endesa-hoy`, 7 `pvpc-precio-hoy-tarifa-regulada`, 8 `franjas-horarias-luz-hoy`, 9 `precio-luz-horas-ahorrar-factura-energetica`, 10 `consumo-fantasma…` |
| Refresco runtime del título | Solo si Inspección de URL o un dispositivo real muestran una fecha distinta a la del día; en ese caso se abre una PR pequeña (`fase-9-titulo-runtime`) |
| Baseline | La fecha de cierre y los valores de GSC/GA4 de ese día se anotan en `retro.md` |

## Alcance

1. Producción: `curl -sI` de los redirects de las fases 2 y 8; `curl -s` de home, precio-luz-manana y los cinco artículos para confirmar fecha del día en `<title>` y presencia única de `G-E9V8ZPM3P0`.
2. Esperar al build de la tarde (tras 19:22 UTC) y confirmar que `/precio-luz-manana/` pasa a estado C, y al del mediodía (tras 12:15 UTC) para el estado B; anotar horas reales.
3. Prueba de resultados enriquecidos en las 8 URLs editadas; PSI móvil en home, precio-luz-manana e Iberdrola comparado con los baselines de las fases 1, 4, 5 y 6.
4. Dispositivo real (móvil): home y precio-luz-manana, tabla, gráfico, Quick Answer y enlaces.
5. GSC: reenviar sitemap; Inspección de URL + solicitar indexación en el orden decidido (dos días si hace falta por cuota).
6. GA4: confirmar sesiones diarias del orden de los clics de GSC.
7. Escribir `retro.md` con fecha de cierre, baseline y lo aprendido; marcar los checklists de las fases.
8. Crear una nota de seguimiento: a 6 semanas, export de GSC y `/audit-gsc` comparado con `drafts/informe-seo-2026-09/datos/`.

## Fuera de alcance

Nuevas optimizaciones. Sprint INP.

## Tareas

- [x] Rama `fase-9-qa-cierre` (solo si hay correcciones; la retro se puede commitear directa a `main` como docs)
- [x] Redirects verificados en producción
- [x] Fecha del día en los 7 titles y GA4 presente una vez en cada página
- [x] Estados B y C de precio-luz-manana observados y anotados con hora (B 18:30, C 21:36; ver retro)
- [x] Resultados enriquecidos sin errores en las 8 URLs
- [x] PSI móvil comparado con baselines: ningún INP empeora de bucket
- [ ] QA en móvil real
- [x] Sitemap reenviado; indexación solicitada para las 10 URLs
- [ ] GA4 midiendo (sesiones/día anotadas)
- [x] `retro.md` escrito; checklists de fases marcados
- [x] Recordatorio a 6 semanas creado (rutina trig_01DWRL5Si69opk5GLoY2V7MS, 30 oct 09:00)
- [x] Tests, lint y format en verde
- [x] PR (si hay correcciones): #81, crons redundantes

## Criterios de aceptación

- `curl -sI https://www.apaga-luz.com/Blog`, `/precio-luz-manana`, `/noticias/como-ahorrar-precio-luz-por-horas/` → 301 con `Location` correcta.
- `curl -s https://www.apaga-luz.com/ | grep -o "<title>[^<]*"` contiene el día de la semana de hoy en Madrid; lo mismo en `/precio-luz-manana/` con mañana y en los cinco artículos.
- `curl -s <url> | grep -c G-E9V8ZPM3P0` = 2 en todas las URLs muestreadas.
- Prueba de resultados enriquecidos: 0 errores en las 8 URLs.
- PSI móvil: INP de `/`, `/precio-luz-manana/` y `precio-luz-iberdrola-hoy` no peor que su baseline.
- GSC: sitemap con estado "Correcto" y fecha de lectura posterior al cierre; 10 solicitudes de indexación enviadas.
- GA4 Informes > Tiempo real y Adquisición: sesiones del día ≥ 1.000.
- `docs/sprints/01/retro.md` sin la línea "_(se escribe al cerrar el sprint)_".

## Skills recomendados

- `claude-in-chrome`: GSC (sitemap, inspección, solicitud de indexación), GA4, PSI y prueba de resultados enriquecidos desde la sesión.
- `performance-benchmarker`: comparación de INP contra baselines.
- `/audit-schema`: pasada final sobre todas las páginas editadas.
- `/code-review` antes de la PR si hay correcciones; `/create-commit` y `/create-pr`.

## PROMPT

```
Vamos a ejecutar la Fase 9 del Sprint 01 de "apaga-luz". Lee docs/sprints/01/README.md y docs/sprints/01/fase-9-qa-cierre.md, y los baselines anotados en fase-1-ga4.md, fase-4-precio-luz-manana.md, fase-5-home.md y fase-6-articulos-hoy.md. Las decisiones están cerradas y no se re-preguntan: orden de solicitud de indexación, refresco runtime del título solo si el QA lo justifica, baseline en retro.md. Orden: verificación por curl en producción, observación de los estados B y C de precio-luz-manana, resultados enriquecidos y PSI, GSC (sitemap + indexación con claude-in-chrome; yo estoy logueado), GA4, retro y recordatorio a 6 semanas. Yo hago a mano la prueba en móvil real y te paso el resultado. Si aparece una corrección, crea la rama fase-9-qa-cierre y ejecuta solo esa corrección. Antes de abrir la PR, lanza /code-review y atiende sus hallazgos.
```
