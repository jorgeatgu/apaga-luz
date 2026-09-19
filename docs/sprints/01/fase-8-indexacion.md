# Fase 8 — Indexación: fusión con 301 y ampliación de consumo fantasma

## Objetivo

Resolver los dos artículos que Google rastrea y decide no indexar: fusionar `como-ahorrar-precio-luz-por-horas` en `precio-luz-horas-ahorrar-factura-energetica` con redirect 301, y ampliar `consumo-fantasma-identificar-eliminar-gasto-electrico-en-tu-hogar` con datos concretos y HowTo para que merezca índice.

## Dependencias

Fase 2 (edita `vercel.json`) y fase 7 (edita `vite.config.js`, `public/sitemap.xml`, `noticias/index.html`). Va en serie tras la 7.

## Lo que hay hoy

- GSC > Indexación > "Rastreada: actualmente sin indexar": `noticias/consumo-fantasma-identificar-eliminar-gasto-electrico-en-tu-hogar/` (último rastreo 21 ago 2026) y `noticias/como-ahorrar-precio-luz-por-horas/` (22 jun 2026). Ambos con 0 clics en 3 meses (`como-ahorrar…` con 213 impr, pos 7,6 en su única aparición; `consumo-fantasma` no aparece en la tabla de páginas).
- Tamaños: `como-ahorrar-precio-luz-por-horas` 3.448 palabras de HTML; `precio-luz-horas-ahorrar-factura-energetica` 3.368; `consumo-fantasma` 5.163.
- H2 de `como-ahorrar-precio-luz-por-horas`: "¿Por qué varía el precio de la luz por horas?", "5 Estrategias Prácticas para Ahorrar", "Ejemplos Reales de Ahorro Mensual", "Errores Comunes que Debes Evitar", "Herramientas para Optimizar tu Ahorro", "Conclusión". Solapa en intención con `precio-luz-horas-ahorrar-factura-energetica` (abr 2025) y con `horas-baratas-luz/` (herramienta).
- `SCHEMA_AUDIT.md` ya proponía añadir HowTo a `como-ahorrar-precio-luz-por-horas` y a `consumo-fantasma`.
- Patrón de redirect en `vercel.json` (fase 2). Patrón canónico de schema: `noticias/precio-luz-canarias-hoy/` (Article + BreadcrumbList + FAQPage + HowTo en bloques separados).
- Al retirar una página hay que quitarla de `vite.config.js` (`rollupOptions.input`), de `public/sitemap.xml`, de `noticias/index.html` y de `index.html` si tiene card, y comprobar con `grep -rl "como-ahorrar-precio-luz-por-horas" --include=index.html .` los enlaces internos que apuntan a ella para repuntarlos al destino.

## Comparativa (18 sep 2026)

Tres artículos del solape: `como-ahorrar-precio-luz-por-horas` (origen), `precio-luz-horas-ahorrar-factura-energetica` (destino) y `horas-baratas-luz/` (herramienta; no se toca).

| Sección de `como-ahorrar…` | Dónde está ya | Decisión |
|---|---|---|
| ¿Por qué varía el precio por horas? + franjas valle/llano/punta | Destino: Quick Answer, "Dentro del engranaje del mercado" y H2 "¿A qué hora es más barata la luz?"; herramienta `horas-baratas-luz/` | No se traslada |
| 5 estrategias (tabla horario por aparato, climatización, fines de semana, VE, termo) | Destino: tabla punta/valle por aparato, "Ahorrando a través… de los hábitos", fines de semana en franjas | No se traslada salvo un apunte de climatización (pre-enfriar o precalentar en valle) |
| Ejemplos reales de ahorro mensual (3 perfiles con tabla) | No existe en el destino | **Se traslada** como H2 "¿Cuánto se ahorra al mes según el tipo de hogar?" |
| Errores comunes (5) | No existe en el destino | **Se traslada** como H2 "¿Qué errores hay que evitar…?"; el error 3 enlaza a consumo fantasma |
| Herramientas: apps, automatización, medición | Destino: "La era digital…" y "Navegando por sistemas domóticos" | No se traslada salvo la calculadora de ahorro en 5 pasos |
| Conclusión | — | No se traslada |
| FAQ schema (5 preguntas) | Destino tiene 4 (ahorro anual, hora más barata, electrodomésticos, precio medio) | Se trasladan "¿Cuánto se ahorra al mes según el tipo de hogar?" (recalculada con el ahorro por uso del destino) y "¿Qué errores debo evitar…?" |

## Decisiones cerradas

| Tema | Decisión |
|---|---|
| `como-ahorrar-precio-luz-por-horas` | Se fusiona en `precio-luz-horas-ahorrar-factura-energetica`: se traslada lo que no esté ya (ejemplos de ahorro mensual, errores comunes) como secciones nuevas; 301 en `vercel.json`; se elimina la carpeta y sus registros; enlaces internos repuntados |
| `consumo-fantasma` | Se amplía con una tabla `post-table` de consumo en standby por aparato (W) y coste anual calculado con el precio medio actual (placeholder del plugin o cifra fija con fecha), HowTo schema de 4-6 pasos, FAQ si falta, y 3 enlaces entrantes desde artículos afines (`mejores-horas-electrodomesticos`, `precio-luz-horas-ahorrar-factura-energetica`, `como-afecta-tarifa-por-horas-a-tu-factura`) |
| `dateModified` | Actualizado en los dos artículos que quedan |
| Solicitud de indexación | Se hace en la fase 9 |

## Alcance

1. Comparar los tres artículos del solape y listar en este fichero qué secciones de `como-ahorrar…` se trasladan.
2. Trasladar contenido a `precio-luz-horas-ahorrar-factura-energetica`, actualizar FAQ/schema y `dateModified`.
3. Eliminar `noticias/como-ahorrar-precio-luz-por-horas/`, quitarlo de `vite.config.js`, `sitemap.xml`, `noticias/index.html`, `index.html`; añadir 301 en `vercel.json`; repuntar enlaces internos.
4. Ampliar `consumo-fantasma` (tabla, HowTo, FAQ, enlaces entrantes, `dateModified`).
5. Build sin errores; `/audit-schema` en los dos artículos.

## Fuera de alcance

Reescribir por completo cualquiera de los artículos. Otros artículos del informe de schema.

## Tareas

- [x] Rama `fase-8-indexacion`
- [x] Comparativa de los tres artículos anotada aquí
- [x] Contenido trasladado a `precio-luz-horas-ahorrar-factura-energetica`
- [x] Carpeta eliminada, registros retirados, 301 añadido, enlaces repuntados
- [x] `consumo-fantasma` ampliado con tabla, HowTo, FAQ y enlaces entrantes
- [x] `dateModified` en ambos
- [x] Build sin errores
- [x] `/audit-schema` sin errores en ambos
- [x] Tests, lint y format en verde
- [x] PR (#80)

## Criterios de aceptación

- `test ! -d noticias/como-ahorrar-precio-luz-por-horas` y `grep -rl "como-ahorrar-precio-luz-por-horas" --include=index.html --include=*.xml --include=vite.config.js . | grep -v build` devuelve nada.
- `vercel.json` contiene la ruta 301 de `/noticias/como-ahorrar-precio-luz-por-horas/` a `/noticias/precio-luz-horas-ahorrar-factura-energetica/`.
- `grep -c '"@type": "HowTo"' noticias/consumo-fantasma-identificar-eliminar-gasto-electrico-en-tu-hogar/index.html` = 1 y hay una `<table class="post-table">` con al menos 8 aparatos.
- `grep -l "consumo-fantasma" noticias/mejores-horas-electrodomesticos/index.html noticias/precio-luz-horas-ahorrar-factura-energetica/index.html noticias/como-afecta-tarifa-por-horas-a-tu-factura/index.html | wc -l` = 3.
- `npm run build` sin errores; `/audit-schema` sin errores en los dos artículos.

## Skills recomendados

- `seo-analysis-monitoring:seo-cannibalization-detector` (agente): comparativa de los tres artículos del solape.
- `seo-analysis-monitoring:seo-content-refresher` (agente): qué actualizar en consumo-fantasma.
- `aeo-strategy`: HowTo y FAQ.
- `/audit-schema`.
- `/code-review` antes de la PR; `/create-commit` y `/create-pr`.

## PROMPT

```
Vamos a ejecutar la Fase 8 del Sprint 01 de "apaga-luz". Lee docs/sprints/01/README.md y docs/sprints/01/fase-8-indexacion.md. Antes de escribir nada, lee enteros: noticias/como-ahorrar-precio-luz-por-horas/index.html, noticias/precio-luz-horas-ahorrar-factura-energetica/index.html, noticias/consumo-fantasma-identificar-eliminar-gasto-electrico-en-tu-hogar/index.html, noticias/precio-luz-canarias-hoy/index.html (patrón de schema con HowTo), vercel.json y drafts/informe-seo-2026-09/07-indexacion.md. Las decisiones están cerradas y no se re-preguntan: fusionar como-ahorrar en precio-luz-horas-ahorrar-factura-energetica con 301 y retirar sus registros; ampliar consumo-fantasma con tabla de consumos, HowTo, FAQ y 3 enlaces entrantes; dateModified en ambos. Orden: comparativa, traslado, retirada y 301, ampliación de consumo-fantasma, build, /audit-schema. Crea la rama fase-8-indexacion y ejecuta el alcance completo. Antes de abrir la PR, lanza /code-review y atiende sus hallazgos.
```
