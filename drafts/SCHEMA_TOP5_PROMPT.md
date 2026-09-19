# Prompt para nueva ventana — Top 5 acciones schema JSON-LD

> Copia y pega el bloque siguiente en una conversación nueva de Claude Code dentro de `/Users/jorgeatgu/github/apaga-luz`.

---

## Contexto

Estoy trabajando en el proyecto **apaga-luz** (sitio estático HTML/CSS/JS en Vercel). En la última auditoría schema (ver `SCHEMA_AUDIT.md` en la raíz, fechado 2026-05-07) quedaron identificadas **5 acciones priorizadas**. Quiero ejecutarlas en este orden, con verificación al final de cada bloque.

**Lee primero**: `SCHEMA_AUDIT.md` (línea base completa) para tener la foto general antes de tocar nada.

**Patrón canónico de schema** que debes seguir: ver `noticias/precio-luz-canarias-hoy/index.html` líneas 37-189 (Article + BreadcrumbList + FAQPage + HowTo en 4 bloques `<script type="application/ld+json">` independientes, no `@graph`).

**Publisher canónico** (usa estos valores literales en publisher/author de cada Article que toques):
```json
"author": {"@type": "Organization", "name": "Apaga-luz", "url": "https://www.apaga-luz.com"},
"publisher": {
  "@type": "Organization",
  "name": "Apaga-luz",
  "logo": {"@type": "ImageObject", "url": "https://www.apaga-luz.com/apple-touch-icon.png"}
}
```

---

## Acción 1 — Fix `publisher.logo.url` en bono-social-electrico

Archivo: `noticias/bono-social-electrico-guia-completa/index.html`

El bloque Article tiene `"logo": {"@type": "ImageObject"}` vacío. Cambiar a:
```json
"logo": {"@type": "ImageObject", "url": "https://www.apaga-luz.com/apple-touch-icon.png"}
```

También: `dateModified` está en `2025-05-09`. Actualizar a la fecha de hoy si añades cambios sustanciales en la siguiente acción. Si solo arreglas el logo, dejar fecha.

---

## Acción 2 — Añadir FAQPage a 8 artículos

Para cada artículo de la lista, leer el HTML (especialmente los H2 que empiezan por `¿…?`) y construir un `FAQPage` con **4-5 preguntas extraídas del contenido real**, no inventadas. Insertar el bloque después del Article y antes del `<link rel="preload" as="font"`. Patrón exacto: copiar la estructura de `precio-luz-canarias-hoy/index.html` líneas 89-136.

Lista (ordenada por valor estimado, hacer en este orden):

1. `noticias/sistemas-respaldo-electrico/index.html`
2. `noticias/tarifas-de-totalenergies-luz-y-gas/index.html`
3. `noticias/comparador-tarifas-luz-y-gas/index.html`
4. `noticias/consumo-fantasma-identificar-eliminar-gasto-electrico-en-tu-hogar/index.html`
5. `noticias/interpretar-graficas-precio-luz-tiempo-real/index.html`
6. `noticias/como-ahorrar-precio-luz-por-horas/index.html`
7. `noticias/diez-inluencers-ecologicos-para-seguir-redes-sociales/index.html`
8. `noticias/subastas-precio-luz-manana/index.html` (este también necesita reescritura de headline/description, ver Acción 3)

Para cada uno: actualizar también `dateModified` a la fecha actual y la línea visible "Última actualización" si existe.

---

## Acción 3 — Reescribir headlines/descriptions cortos

Reglas: `headline` 60-110 caracteres, `description` 140-160 caracteres. Mantener consistente con el `<h1>` real del artículo; si el H1 también es corto, reescribir ambos.

Archivos:

| Slug | Problema |
|---|---|
| `subastas-precio-luz-manana` | headline 32c, description 60c, headline≠H1 |
| `newsletter-precio-luz-manana` | headline 34c, description 92c |
| `nueva-clasificacion-colores-horas` | headline 36c, description 63c |
| `comparador-tarifas-luz-y-gas` | headline 49c, description 138c |
| `mejores-horas-electrodomesticos` | headline 50c |

Antes de cambiar el `<title>` y `<meta name="description">` HTML, propón los nuevos textos al usuario para validación (cambian el SERP).

---

## Acción 4 — Limpiar borradores sueltos

Hay dos directorios en `noticias/` con solo `article.md` (sin `index.html`). Generan ruido y aparecieron como falsos duplicados en auditorías anteriores.

- `noticias/precio-luz-hoy-por-horas/article.md`
- `noticias/tarifas-electricas-diarias-pvpc/article.md`
- `noticias/tarifas-electricas-diarias-pvpc/outline.md`

Pregunta al usuario qué hacer:
- (a) Mover a un nuevo `drafts/` en la raíz.
- (b) Borrar.
- (c) Publicar como artículos nuevos (entonces necesitan `index.html` con schema completo).

No actúes sin confirmación: borrar es irreversible.

---

## Acción 5 — Corregir typo `diez-inluencers-…` (opcional)

El slug actual es `diez-inluencers-ecologicos-para-seguir-redes-sociales` (falta la `f` en "influencers"). El SEO ya lo ha indexado con typo, así que el cambio tiene riesgo.

Si decides corregir:
1. Crear `noticias/diez-influencers-ecologicos-para-seguir-redes-sociales/index.html` (copia del actual con `<link rel="canonical">` apuntando a la URL nueva).
2. Añadir 301 en `vercel.json`:
   ```json
   {
     "src": "/noticias/diez-inluencers-ecologicos-para-seguir-redes-sociales/",
     "status": 301,
     "headers": { "Location": "/noticias/diez-influencers-ecologicos-para-seguir-redes-sociales/" }
   }
   ```
3. Borrar el directorio antiguo.

Pregunta al usuario antes de hacerlo. El audit lo marca como prioridad baja.

---

## Verificación tras cada acción

Tras editar cualquier archivo, valida que **todos los bloques JSON-LD parsean** con este script (ejecutar desde la raíz del repo):

```bash
python3 -c "
import json, re
from pathlib import Path
err = 0
for f in Path('noticias').rglob('index.html'):
    html = f.read_text(encoding='utf-8', errors='replace')
    for i, b in enumerate(re.findall(r'<script type=\"application/ld\+json\">(.*?)</script>', html, re.DOTALL)):
        try: json.loads(b)
        except Exception as e:
            print(f'FAIL {f} block {i}: {e}'); err += 1
print(f'errors={err}')
"
```

Debe imprimir `errors=0`.

Tras terminar las 5 acciones, propón sobreescribir `SCHEMA_AUDIT.md` con los datos refrescados.

---

## Restricciones

- **No** modifiques `vercel.json` salvo en la Acción 5 (con confirmación).
- **No** uses `@graph` en los nuevos schemas — el patrón del proyecto es bloques `<script>` separados.
- Mantén `<link rel="canonical">` y la línea visible `"Última actualización: …"` sincronizadas con `dateModified`.
- Antes de cualquier cambio destructivo (Acciones 4 y 5), pide confirmación explícita.

---

## Tarea inmediata

Empieza por la **Acción 1** (fix logo en bono-social-electrico). Es 1 línea, riesgo cero, y desbloquea el rich result. Después continúa con la Acción 2 en el orden indicado.
