# Fase 4 — `/precio-luz-manana/`: título con fecha, Quick Answer, schema y enlaces

## Objetivo

Convertir `/precio-luz-manana/` en la mejor respuesta para "precio luz mañana", "precio de la luz mañana" y "tarifa luz mañana": 100.000 impresiones por trimestre en posición 10 con CTR del 1 % (2.450 clics frente a 5.607 en 2025). El título y el Quick Answer llevan la fecha de mañana y el dato del día en el HTML estático, con tres estados según la subasta publicada.

## Dependencias

Fase 3 mergeada (placeholders del plugin). Paralela a las fases 5 y 6 (páginas distintas). No toca `vercel.json` ni `vite.config.js`.

## Lo que hay hoy

- `precio-luz-manana/index.html` (1.140 líneas): `<title>` en la línea 7 ("Precio luz mañana hora a hora | Tarifa PVPC actualizada 2026"), `<h1 class="post-title">` en la 626 ("Precio de la luz mañana hora a hora"), meta description con "actualizado a las 20:15". Cinco bloques JSON-LD (líneas 21, 83, 104 FAQPage, 177, 234). El grid de la tabla de mañana en la 795 y `tomorrow.js` en la 1140.
- `source/javascript/tomorrow.js` pinta la tabla en runtime y decide OMIE/ESIOS por hora del navegador (líneas 40-75). **No se toca.**
- Datos GSC del cluster (3 meses): tarifa luz mañana 28.570 impr / 183 clics / pos 10,0; precio luz mañana 25.974 / 169 / 10,5; precio de la luz mañana 18.950 / 196 / 10,2; luz mañana 3.282 / 21 / 10,1; el precio de la luz mañana 1.621 / 15 / 10,8; precio luz mañana por horas 1.475 / 17 / 12,1; pvpc mañana 984 / 10 / 9,2. Ahrefs: "precio de la luz mañana miércoles" posiciona 4 con esta URL, señal de que el día en el título funciona.
- Páginas que deberían enlazar con anchor exacto y hoy no siempre lo hacen: `index.html` (ya enlaza), `horas-baratas-luz/index.html`, `noticias/franjas-horarias-luz-hoy/`, `noticias/precio-luz-por-hora/`, `noticias/tarifas-electricas-diarias/`, `noticias/pvpc-precio-hoy-tarifa-regulada/`. Comprobar con `grep -l "precio-luz-manana" noticias/*/index.html`.
- Canonical correcta (`https://www.apaga-luz.com/precio-luz-manana/`). Redirect de la variante sin barra en la fase 2.

## Decisiones cerradas

| Tema | Decisión |
|---|---|
| Title | "Precio de la luz mañana, {diaSemana} {día} de {mes}: hora más barata y precio por horas" (fallback: "Precio de la luz mañana hora a hora: hora más barata y tabla por horas") |
| H1 | Igual que el title sin la cola de marca |
| Quick Answer | 40-60 palabras, antes del primer H2, con tres estados: A) "El precio de la luz de mañana, {fecha}, se publica a las 13:30 y hora a hora a las 20:15. Hoy la hora más barata es {hoy.horaMasBarata} ({hoy.precioMasBarato} €/kWh)". B) "Mañana, {fecha}, el precio medio de la luz será {precioMedio} €/kWh. La hora más barata, {horaMasBarata}; la más cara, {horaMasCara}. El precio hora a hora se publica a las 20:15". C) igual que B con datos PVPC y sin la última frase. Nunca la palabra "mayorista" |
| H2 en forma de pregunta | "¿Cuál es el precio de la luz mañana hora a hora?", "¿A qué hora es más barata la luz mañana?", "¿Cuándo se publica el precio de la luz de mañana?" |
| Schema | FAQPage actualizado con esas preguntas (respuestas sin datos volátiles) + `Dataset` que describe `public/data/tomorrow_price.json` (distribution, temporalCoverage, license) |
| Enlaces internos | Anchor exacto "precio de la luz mañana" desde las 5 páginas listadas |
| Runtime | No se reescribe el título con JS en esta fase; si en QA (fase 9) se detecta HTML cacheado con fecha vieja, se añade |

## Alcance

1. Baseline PSI móvil de `/precio-luz-manana/` anotado aquí.
2. Sustituir title, meta description y H1 por placeholders del plugin con fallback.
3. Insertar el bloque Quick Answer con los tres estados (`<!--dd:if manana.estado=…-->`) antes del primer H2, con clase `post-text` y un `<p>` de 40-60 palabras por estado.
4. Reestructurar los H2 existentes a forma de pregunta sin eliminar contenido; añadir las tres preguntas si faltan.
5. Actualizar el bloque FAQPage y añadir el bloque `Dataset`.
6. Añadir los enlaces internos con anchor exacto en las 5 páginas.
7. `npm run build`; comprobar que `build/precio-luz-manana/index.html` contiene la fecha de mañana en title y H1 y el estado correcto según los JSON del momento.
8. Smoke test manual de la tabla de mañana en `vite preview` (antes y después de las 20:15 si es posible; si no, con el estado que haya).
9. `/audit-schema precio-luz-manana/` antes y después.

## Fuera de alcance

Cambios en `tomorrow.js`, en la tabla o en el gráfico. Redirects (fase 2). Refresco del título en runtime.

## Tareas

- [x] Rama `fase-4-precio-luz-manana`
- [ ] Baseline PSI móvil anotado
- [x] `/audit-schema` antes, resultado anotado
- [x] Title, meta description y H1 con placeholders y fallback
- [x] Quick Answer con tres estados
- [x] H2 en forma de pregunta
- [x] FAQPage actualizado y Dataset añadido
- [x] Enlaces internos con anchor exacto en las 5 páginas
- [x] Build y comprobación de fecha y estado en `build/`
- [x] Smoke test de la tabla de mañana
- [x] `/audit-schema` después sin errores
- [x] PSI móvil después: INP no empeora
- [x] Tests, lint y format en verde
- [x] PR

_Nota (19 sep 2026): el baseline PSI de esta fase no se anotó; la comparación se hizo en la fase 9 contra un despliegue anterior (ver `retro.md`). Ningún INP cambió de bucket._

## Criterios de aceptación

- `grep -o "<title>[^<]*" build/precio-luz-manana/index.html` contiene el nombre del día de la semana y la fecha de mañana (Madrid).
- `grep -c "dd:if manana.estado" precio-luz-manana/index.html` = 3 y en `build/` solo sobrevive uno de los tres bloques.
- El Quick Answer del build tiene entre 40 y 60 palabras (`wc -w` sobre el párrafo extraído).
- `grep -c '"@type": "Dataset"' precio-luz-manana/index.html` = 1; FAQPage con al menos 3 `Question`.
- `grep -l 'href="/precio-luz-manana/"' horas-baratas-luz/index.html noticias/franjas-horarias-luz-hoy/index.html noticias/precio-luz-por-hora/index.html noticias/tarifas-electricas-diarias/index.html noticias/pvpc-precio-hoy-tarifa-regulada/index.html | wc -l` = 5, y el anchor contiene "precio de la luz mañana".
- `/audit-schema precio-luz-manana/` sin errores.
- La tabla de mañana en `vite preview` muestra los mismos datos que en `main`.
- PSI móvil: INP en el mismo bucket o mejor que el baseline.

## Skills recomendados

- `aeo-strategy`: Quick Answer, H2-pregunta, FAQPage y Dataset.
- `seo-technical-optimization:seo-meta-optimizer` (agente): para afinar title y meta description dentro de los límites de caracteres.
- `seo-technical-optimization:seo-snippet-hunter` (agente): para el formato del Quick Answer y de las respuestas de FAQ.
- `/audit-schema`: antes y después.
- `performance-benchmarker`: PSI antes/después.
- `/code-review` antes de la PR; `/create-commit` y `/create-pr`.

## PROMPT

```
Vamos a ejecutar la Fase 4 del Sprint 01 de "apaga-luz". Lee docs/sprints/01/README.md y docs/sprints/01/fase-4-precio-luz-manana.md. Antes de escribir nada, lee enteros: precio-luz-manana/index.html, la cabecera de scripts/vite-plugin-daily-data.mjs (contrato de placeholders), source/javascript/tomorrow.js (solo para entender qué pinta; no se toca) y drafts/informe-seo-2026-09/02-precio-luz-manana.md. Las decisiones están cerradas y no se re-preguntan: title/H1 con fecha de mañana, Quick Answer con tres estados A/B/C sin la palabra "mayorista", H2-pregunta, FAQPage + Dataset, enlaces internos con anchor exacto en las 5 páginas, sin cambios en tomorrow.js. Orden: baseline PSI y /audit-schema, edición del HTML, enlaces internos, build y comprobaciones, smoke test de la tabla, /audit-schema final. Yo lanzo a mano PageSpeed Insights y te paso los valores. Crea la rama fase-4-precio-luz-manana y ejecuta el alcance completo. Antes de abrir la PR, lanza /code-review y atiende sus hallazgos.
```
