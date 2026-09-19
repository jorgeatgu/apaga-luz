# Fase 5 — Home: día de la semana, Quick Answer y descanibalizar compañías

## Objetivo

Que la home responda a "precio de la luz hoy" con el día de la semana y el dato del día en el título (41.438 impresiones en posición 9 con 49 clics, CTR 0,1 %), y deje de competir con los artículos de Iberdrola, Naturgy y Endesa reduciendo la sección de compañías a tres enlaces. Las consultas con día de la semana ("precio de la luz por horas hoy jueves") tienen CTR del 18-38 %.

## Dependencias

Fase 3 mergeada. Paralela a las fases 4 y 6. La fase 7 edita `index.html` después de esta (añade el enlace a Energía XXI), por eso depende de ella.

## Lo que hay hoy

- `index.html` (683 líneas): `<title>` línea 7 ("Precio luz hoy hora a hora | Tarifa PVPC actualizada | Apaga Luz"); `<h1 class="blog-grid-element-title">` línea 625 ("Precio luz hoy: Tarifa por horas actualizada"); `main.js` en la 683.
- Sección de compañías: `<section class="blog-section" aria-labelledby="precio-por-compania">` en la línea 459 hasta la siguiente `<section class="blog-section">` en la 515, con `<h2 id="precio-por-compania">Precio luz por compañía hoy</h2>` en la 461. Contiene 13 menciones a Iberdrola/Naturgy/Endesa (`grep -o -i "iberdrola\|naturgy\|endesa" index.html | sort | uniq -c`) y enlaces a `/noticias/precio-luz-iberdrola-hoy/` (2), `/noticias/precio-luz-naturgy-hoy/` (3) y `/noticias/precio-luz-endesa-hoy/` (2).
- Ahrefs: la home es la URL que posiciona para "precio luz hoy" (596K vol, pos 26), "precio de la luz hoy hora a hora" (38K, pos 18), "precio luz hoy iberdrola" (25K, pos 17, CPC 4,10 €), "precio luz hoy naturgy por horas" (16K, pos 13), "pvpc hoy" (9,2K, pos 17) y 421 keywords en total (92,6 % del tráfico estimado).
- GSC home: 31.073 clics (36.386 en 2025), 266.162 impr (1.377.980), pos 12,5.
- Datos de hoy: `public/data/today_price.json` (formato en fase 3).

## Decisiones cerradas

| Tema | Decisión |
|---|---|
| Title | "Precio de la luz hoy, {diaSemana} {día} de {mes}, hora a hora \| Apaga Luz" (fallback: "Precio de la luz hoy hora a hora \| Apaga Luz") |
| H1 | "Precio de la luz hoy, {diaSemana} {día} de {mes}, hora a hora" |
| Quick Answer | 40-60 palabras antes del primer H2: precio medio de hoy, hora más barata y hora más cara con sus precios, y una frase sobre mañana ("El precio de mañana se publica a las 20:15" o el dato si ya existe, estado B/C del plugin) |
| Sección compañías | Se sustituye por un párrafo corto con tres enlaces de anchor exacto: "precio luz hoy Iberdrola", "precio luz hoy Naturgy", "precio luz hoy Endesa". Sin H2 con nombres de compañía; si hace falta un H2, "¿Cuánto cuesta la luz hoy con tu compañía?" |
| Resto de la home | Tabla, gráfico, enlaces a mañana/gráficas/horas baratas y sección de blog se mantienen tal cual |

## Alcance

1. Baseline PSI móvil de `/` y `/audit-schema index.html` anotados aquí.
2. Title, meta description y H1 con placeholders y fallback.
3. Quick Answer con placeholders de hoy y bloque condicional para mañana.
4. Reescribir la sección de la línea 459-514: eliminar párrafos y H2 con nombres de compañía, dejar los tres enlaces con anchor exacto (uno por compañía, no repetidos).
5. Revisar que `grep -o -i "iberdrola\|naturgy\|endesa" index.html | wc -l` queda en 3 (solo los anchors) más las que haya en el JSON-LD si las hubiera.
6. Build; comprobar que `build/index.html` lleva el día de la semana correcto en title y H1.
7. Smoke test manual de la tabla de hoy y del gráfico en `vite preview`.
8. `/audit-schema` después.

## Baseline y resultados (18 sep 2026)

**PSI móvil `/`**: pendiente de los valores del usuario (antes y después).

**`/audit-schema index.html` antes**: WebPage + FAQPage (4) + Service parsean. Inconsistencias: `author` Person "Jorge Aznar" (el canónico es Organization Apaga-luz), `publisher.logo` string en vez de ImageObject, `name`/`description` distintos del title y con emojis, sin `dateModified`, sin Quick Answer. Tres de las cuatro preguntas del FAQPage no están en el HTML visible (fuera de alcance, pendiente).

**`/audit-schema` después**: sin errores. WebPage con `name` = title, description de 149 caracteres, `dateModified` del plugin, author/publisher canónicos y `.definition-snippet` en `speakable`.

**Cambios respecto al plan del documento**:
- El bloque del H1 estaba al final del DOM; se sube al principio de `section.container` para que el Quick Answer quede antes del primer H2 (decisión del usuario).
- Se quita también la card de Naturgy del grid del blog para dejar 1 href por compañía (decisión del usuario).
- El párrafo de la tabla con los tres enlaces de compañía pasa a llevar los anchors exactos; la sección `precio-por-compania` (H2 + 5 cards) se elimina entera. TotalEnergies y mejor-comercializadora-pvpc siguen enlazadas desde el footer.

**Comprobaciones del build** (estado A, datos de hoy):
- title/H1: "Precio de la luz hoy, viernes 18 de septiembre, hora a hora".
- Quick Answer: 53 palabras (A), 58 (B), 56 (C), 59 (sin datos de hoy), verificado con `applyPlaceholders` y un contexto simulado.
- `grep -o -i "iberdrola\|naturgy\|endesa" index.html | wc -l` = 6 (3 hrefs + 3 anchors); 1 href por compañía.
- Smoke test en `vite preview` frente a `main`: la tabla de hoy, los botones de ordenar, el checkbox de horas pasadas y las franjas dan el mismo resultado; sin errores de consola. La home no tiene gráfico d3 (los gráficos están en `/graficas/`).
- Observación: si dos horas empatan en el precio mínimo, el Quick Answer (plugin: gana la más temprana) y el widget "La hora más barata" de `main.js` (gana la más tardía) muestran horas distintas. Hoy pasa con las 14:00 y las 15:00 (0,020). No se toca en esta fase.

## Fuera de alcance

`main.js`, `table.js`, `today.js`. Cards del blog (fase 7 añade la de Energía XXI). Cambios de diseño.

## Tareas

- [x] Rama `fase-5-home`
- [ ] Baseline PSI y `/audit-schema` anotados
- [x] Title, meta description y H1 con placeholders
- [x] Quick Answer de hoy (+ frase de mañana condicional)
- [x] Sección de compañías reducida a tres enlaces con anchor exacto
- [x] Build y comprobación del día en `build/index.html`
- [x] Smoke test de tabla y gráfico
- [x] `/audit-schema` después sin errores
- [x] PSI móvil después: INP no empeora
- [x] Tests, lint y format en verde
- [x] PR

_Nota (19 sep 2026): el baseline PSI de esta fase no se anotó; la comparación se hizo en la fase 9 contra un despliegue anterior (ver `retro.md`). Ningún INP cambió de bucket._

## Criterios de aceptación

- `grep -o "<title>[^<]*" build/index.html` contiene el día de la semana y la fecha de hoy (Madrid).
- `grep -o -i "iberdrola\|naturgy\|endesa" index.html | wc -l` ≤ 6 (tres anchors, más como máximo tres menciones en `alt` o schema), frente a 26 hoy.
- `grep -c 'href="/noticias/precio-luz-iberdrola-hoy/"' index.html` = 1 (igual para Naturgy y Endesa).
- Quick Answer de 40-60 palabras en `build/index.html` con dos precios en €/kWh y dos horas.
- `/audit-schema index.html` sin errores.
- Tabla de hoy y gráfico idénticos a `main` en `vite preview`.
- PSI móvil: INP en el mismo bucket o mejor.

## Skills recomendados

- `aeo-strategy`: Quick Answer y H2.
- `seo-analysis-monitoring:seo-cannibalization-detector` (agente): para pasar la home y los tres artículos y confirmar que la home ya no compite por las consultas branded.
- `seo-technical-optimization:seo-meta-optimizer` (agente): title y meta description.
- `/audit-schema`, `performance-benchmarker`.
- `/code-review` antes de la PR; `/create-commit` y `/create-pr`.

## PROMPT

```
Vamos a ejecutar la Fase 5 del Sprint 01 de "apaga-luz". Lee docs/sprints/01/README.md y docs/sprints/01/fase-5-home.md. Antes de escribir nada, lee enteros: index.html, la cabecera de scripts/vite-plugin-daily-data.mjs (contrato de placeholders) y drafts/informe-seo-2026-09/03-home-descanibalizar.md. Las decisiones están cerradas y no se re-preguntan: title/H1 con día de la semana y fecha, Quick Answer con precio medio, hora más barata y hora más cara de hoy, sección de compañías reducida a tres enlaces con anchor exacto y sin H2 con nombres de compañía, sin tocar main.js, table.js ni today.js. Orden: baseline PSI y /audit-schema, edición del HTML, build y comprobaciones, smoke test de tabla y gráfico, /audit-schema final. Yo lanzo a mano PageSpeed Insights y te paso los valores. Crea la rama fase-5-home y ejecuta el alcance completo. Antes de abrir la PR, lanza /code-review y atiende sus hallazgos.
```
