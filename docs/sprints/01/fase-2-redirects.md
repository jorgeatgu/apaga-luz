# Fase 2 — Redirects `/Blog` y `/precio-luz-manana` sin barra

## Objetivo

Recuperar el valor de los enlaces entrantes que apuntan a dos URLs que hoy no consolidan: `/Blog` responde 404 y `/precio-luz-manana` (sin barra final) responde 200 como duplicado de `/precio-luz-manana/`.

## Dependencias

Ninguna. Paralela a las fases 1 y 3. La fase 8 también edita `vercel.json`, por eso depende de esta.

## Lo que hay hoy

- `vercel.json`: solo la clave `routes`, 30 entradas con el patrón:

```json
{ "src": "/noticias/luz-barata-2025/", "status": 301, "headers": { "Location": "/noticias/companias-electricas-mas-baratas-2026/" } }
```

- Producción (comprobado con `curl -sI` el 18 sep 2026): `/Blog` → 404; `/precio-luz-manana` → 200; `/precio-luz-manana/` → 200 con `<link rel="canonical" href="https://www.apaga-luz.com/precio-luz-manana/">` (`precio-luz-manana/index.html:14` aprox.).
- Ahrefs "Páginas principales": `/Blog` tiene 22 visitas/mes estimadas y posiciona "precio luz hoy energia xxi" en 13; `/precio-luz-manana` sin barra tiene 55 dominios de referencia y 10 visitas/mes.
- No hay `trailingSlash` ni `cleanUrls` en `vercel.json`; Vercel sirve ambas variantes.

## Decisiones cerradas

| Tema | Decisión |
|---|---|
| `/Blog` y `/blog` | 301 a `/noticias/` |
| `/precio-luz-manana` sin barra | 301 a `/precio-luz-manana/` |
| Resto de páginas sin barra | Se comprueba si ocurre lo mismo en `/graficas`, `/horas-baratas-luz`, `/preguntas`, `/tipos-tarifas-electricas`, `/compensacion-del-gas`; si responden 200, se añaden también |

## Alcance

1. Añadir las rutas 301 en `vercel.json` siguiendo el patrón existente. La regla de `/precio-luz-manana` debe usar `"src": "/precio-luz-manana"` exacto (sin regex que capture la variante con barra).
2. Comprobar con `curl -sI` las otras páginas-herramienta sin barra y añadir sus 301 si duplican.
3. Verificar en local con `vercel dev` o, tras el deploy de preview, con `curl -sI` que cada 301 apunta a la URL con barra y que `/precio-luz-manana/` sigue 200.

## Fuera de alcance

Redirects de artículos antiguos (ya existen), configurar `trailingSlash` global (cambio de comportamiento para todo el sitio; se evalúa en otro sprint).

## Tareas

- [x] Rama `fase-2-redirects`
- [x] Rutas 301 para `/Blog`, `/blog`, `/precio-luz-manana`
- [x] Comprobación de las otras páginas sin barra y rutas añadidas si procede (las 5 respondían 200: añadidas)
- [x] Verificación con `curl -sI` en preview: 301 con `Location` correcta; `/precio-luz-manana/` sigue 200
- [x] Tests, lint y format en verde (no hay scripts `test`/`lint` que cubran `vercel.json`; validado con `JSON.parse`)
- [x] PR

## Resultados (18 sep 2026)

Preview: `https://apaga-feiy5lqof-jorge-aznars-projects.vercel.app` (`dpl_CVrPBMRYVbtgYxVdqkAWD6e6Y3bS`, estado Ready). `vercel.json` validado con `JSON.parse` sin error.

Rutas añadidas en `vercel.json`, justo después de `/ahorra-en-tu-factura(/)?`: `/Blog(/)?`, `/blog(/)?`, `/precio-luz-manana`, `/graficas`, `/horas-baratas-luz`, `/preguntas`, `/tipos-tarifas-electricas`, `/compensacion-del-gas`.

| URL | Producción (antes) | Preview (después) |
|---|---|---|
| `/Blog`, `/blog`, `/Blog/`, `/blog/` | 404 | 301 → `/noticias/` |
| `/BLOG` | 404 | 301 → `/noticias/` |
| `/precio-luz-manana` | 200 | 301 → `/precio-luz-manana/` |
| `/graficas` | 200 | 301 → `/graficas/` |
| `/horas-baratas-luz` | 200 | 301 → `/horas-baratas-luz/` |
| `/preguntas` | 200 | 301 → `/preguntas/` |
| `/tipos-tarifas-electricas` | 200 | 301 → `/tipos-tarifas-electricas/` |
| `/compensacion-del-gas` | 200 | 301 → `/compensacion-del-gas/` |
| Las 6 páginas-herramienta con barra, `/noticias/`, `/` | 200 | 200 |
| `/ahorra-en-tu-factura`, `/noticias/luz-barata-2026/` (control) | 301 | 301, sin cambios |
| `/precio-luz-manana?utm_source=x` | 200 | 301 → `/precio-luz-manana/?utm_source=x` |

Observaciones:

- El match de `src` en `routes` no distingue mayúsculas (`/BLOG` también redirige). Por eso `/blog(/)?` es redundante con `/Blog(/)?`, y las rutas sin barra también cubren variantes como `/Graficas`.
- Vercel conserva la query string en el 301.
- Ni el HTML ni `public/sitemap.xml` tienen enlaces internos a las versiones sin barra.

Seguimiento (fuera de alcance):

- `/noticias` y `/politica-de-privacidad` sin barra también responden 200 como duplicado. No son páginas-herramienta; se pueden añadir en la fase 8 (que también toca `vercel.json`) o al evaluar `trailingSlash` global.
- `tipos-tarifas-electricas/index.html` y `compensacion-del-gas/index.html` no tienen `<link rel="canonical">`.

## Criterios de aceptación

- `curl -sI https://<preview>/Blog | grep -i "^HTTP\|^location"` → `301` y `Location: /noticias/`.
- `curl -sI https://<preview>/precio-luz-manana | grep -i "^HTTP\|^location"` → `301` y `Location: /precio-luz-manana/`.
- `curl -sI https://<preview>/precio-luz-manana/` → `200`.
- `node -e "JSON.parse(require('fs').readFileSync('vercel.json'))"` sin error.

## Skills recomendados

- `vercel:deploy`: para desplegar una preview y verificar los redirects antes de mergear.
- `/code-review` antes de la PR; `/create-commit` y `/create-pr`.

## PROMPT

```
Vamos a ejecutar la Fase 2 del Sprint 01 de "apaga-luz". Lee docs/sprints/01/README.md y docs/sprints/01/fase-2-redirects.md. Lee entero vercel.json antes de tocarlo. Las decisiones están cerradas: 301 de /Blog y /blog a /noticias/, 301 de /precio-luz-manana sin barra a /precio-luz-manana/, y lo mismo para cualquier otra página-herramienta sin barra que responda 200. Orden: editar vercel.json, validar JSON, desplegar preview con vercel:deploy, verificar con curl y anotar los resultados en el fichero de la fase. Crea la rama fase-2-redirects y ejecuta el alcance completo. Antes de abrir la PR, lanza /code-review y atiende sus hallazgos.
```
