# Fase 7 — Artículo nuevo: precio luz hoy Energía XXI

## Objetivo

Publicar `noticias/precio-luz-energia-xxi-hoy/`, el único hueco de contenido con demanda demostrada y sin página: 27 consultas con "xxi" en GSC (3.293 impresiones, 29 clics en 3 meses, "energía xxi precio luz hoy" 790 impr pos 9,3 y "energía xxi precio luz mañana" 594 impr pos 8,7). Ahrefs: "precio luz hoy energia xxi" 1,9K búsquedas/mes, KD 0, CPC 1,10 €, y hoy lo posiciona en 13 la URL rota `/Blog`.

## Dependencias

Fases 5 (home) y 6 (artículo de Endesa ya actualizado con placeholders, que es la plantilla). Toca `vite.config.js`, `public/sitemap.xml`, `noticias/index.html` e `index.html`: la fase 8 va después.

## Lo que hay hoy

- Plantilla: `noticias/precio-luz-endesa-hoy/index.html` tras la fase 6 (schemas Article + FAQPage + BreadcrumbList, `post-title`, Quick Answer con placeholders, CTA, sponsor-card). Su card en `noticias/index.html` líneas 158-168 (`<a href="…" class="blog-card">` con `blog-card-indicator-blue`, `blog-card-title`, `blog-card-date`, `blog-card-text`, `blog-card-button`).
- `public/sitemap.xml`: entradas `<url><loc>…</loc><lastmod>2026-05-14T12:00:00+00:00</lastmod><priority>0.80</priority></url>` (líneas 188-191 para Endesa).
- `vite.config.js`: cada página en `rollupOptions.input` con clave = slug.
- Home: tras la fase 5, la sección de compañías es un párrafo con tres enlaces de anchor exacto; aquí se añade el cuarto ("precio luz hoy Energía XXI").
- Relación con Endesa: Energía XXI es la comercializadora de referencia (COR) del grupo Endesa; el artículo de Endesa ya menciona "PVPC con Energía XXI" en su card. Este artículo trata el PVPC de Energía XXI (hoy y mañana); el de Endesa, mercado libre frente a PVPC. Esa diferencia es lo que evita canibalizar.
- Convenciones del blog: clases `post-title`, `post-subtitle`, `post-text`, `post-list`, `post-table`, `cta-container`, `sponsor-card`, `social-share`, `related-posts`. Sin emojis.

## Decisiones cerradas

| Tema | Decisión |
|---|---|
| Slug | `noticias/precio-luz-energia-xxi-hoy/` |
| Keyword principal / secundarias | "precio luz hoy energía xxi" / "energía xxi precio luz mañana", "energía xxi precio luz hoy" |
| Title | "Precio luz hoy Energía XXI, {diaSemana} {día} de {mes}: hora más barata y tabla por horas" |
| Estructura | Quick Answer del día (placeholders), H2-pregunta, tabla por horas (mismo mecanismo que Endesa), sección "Precio de la luz mañana con Energía XXI" con el estado B/C del plugin y enlace a `/precio-luz-manana/`, qué es Energía XXI (COR de Endesa, PVPC), FAQ 4-5 preguntas |
| Enlaces entrantes | Home (párrafo de compañías), `precio-luz-endesa-hoy`, `pvpc-precio-hoy-tarifa-regulada`, `mejor-comercializadora-pvpc` |
| Registro | `vite.config.js`, `public/sitemap.xml` (priority 0.80, lastmod del día), card en `noticias/index.html` (primera del grid) y en la sección de blog de `index.html` |

## Alcance

1. Crear el artículo con `/write-article` usando Endesa como plantilla estructural y las decisiones de arriba.
2. Registrar en `vite.config.js`, `public/sitemap.xml`, `noticias/index.html` e `index.html`.
3. Enlaces entrantes desde las cuatro páginas indicadas con anchor "precio luz hoy Energía XXI".
4. Build; comprobar `build/noticias/precio-luz-energia-xxi-hoy/index.html` con fecha en title.
5. `/audit-schema noticias/precio-luz-energia-xxi-hoy/`.
6. Smoke test: render local y sin 404 en enlaces internos.

## Fuera de alcance

Otros artículos nuevos (los pendientes de mayo quedan aplazados por la acción 8 del informe). Cambios en el artículo de Endesa más allá del enlace.

## Tareas

- [x] Rama `fase-7-energia-xxi`
- [x] Artículo creado con `/write-article`, plantilla Endesa
- [x] Registro en `vite.config.js`, `sitemap.xml`, `noticias/index.html`, `index.html`
- [x] Enlaces entrantes desde home, Endesa, PVPC y mejor-comercializadora-pvpc
- [x] Build y comprobación de fecha
- [x] `/audit-schema` sin errores
- [x] Smoke test de render y enlaces
- [x] Tests, lint y format en verde
- [x] PR

## Criterios de aceptación

- `test -f build/noticias/precio-luz-energia-xxi-hoy/index.html` y su `<title>` contiene "Energía XXI" y el día de la semana.
- `grep -c "precio-luz-energia-xxi-hoy" vite.config.js public/sitemap.xml noticias/index.html index.html` = 1 en cada uno como mínimo.
- `grep -l "precio-luz-energia-xxi-hoy" noticias/precio-luz-endesa-hoy/index.html noticias/pvpc-precio-hoy-tarifa-regulada/index.html noticias/mejor-comercializadora-pvpc/index.html | wc -l` = 3.
- `/audit-schema` sin errores; FAQPage con ≥ 4 preguntas.
- Quick Answer de 40-60 palabras; ninguna frase con "mayorista".

## Skills recomendados

- `/write-article`: flujo completo de creación con las reglas AEO del proyecto.
- `aeo-strategy` y `seo-strategy`: Quick Answer, FAQ y control de densidad para no canibalizar el artículo de Endesa.
- `seo-analysis-monitoring:seo-cannibalization-detector` (agente): pasar Endesa y Energía XXI juntos antes de la PR.
- `/audit-schema`.
- `/code-review` antes de la PR; `/create-commit` y `/create-pr`.

## PROMPT

```
Vamos a ejecutar la Fase 7 del Sprint 01 de "apaga-luz". Lee docs/sprints/01/README.md y docs/sprints/01/fase-7-energia-xxi.md. Antes de escribir nada, lee enteros: noticias/precio-luz-endesa-hoy/index.html (plantilla), noticias/index.html (formato de card), public/sitemap.xml, vite.config.js, la cabecera de scripts/vite-plugin-daily-data.mjs y drafts/informe-seo-2026-09/06-energia-xxi.md. Las decisiones están cerradas y no se re-preguntan: slug precio-luz-energia-xxi-hoy, plantilla Endesa, title con fecha, ángulo PVPC de Energía XXI (hoy y mañana) distinto del de Endesa (mercado libre vs PVPC), enlaces entrantes desde home, Endesa, PVPC y mejor-comercializadora-pvpc, registro en vite.config.js, sitemap, noticias/index.html e index.html. Orden: /write-article, registro, enlaces, build, /audit-schema, comprobación de canibalización con Endesa. Crea la rama fase-7-energia-xxi y ejecuta el alcance completo. Antes de abrir la PR, lanza /code-review y atiende sus hallazgos.
```
