# Auditoría Schema JSON-LD — /noticias/

> Fecha: 2026-05-07 (refresco tras ejecución del Top 5)
> Artículos analizados: 33 (excluye `noticias/index.html`; los 2 borradores antiguos se movieron a `/drafts/`)
> Patrón de referencia: `precio-luz-canarias-hoy` (Article + FAQ + Breadcrumb + HowTo)

## Patrón canónico
- **Publisher**: `Apaga-luz` — logo `https://www.apaga-luz.com/apple-touch-icon.png`
- **Author**: `Apaga-luz` — url `https://www.apaga-luz.com`
- **mainEntityOfPage**: `https://www.apaga-luz.com/noticias/{slug}/`

## Resumen

| Métrica | Valor (anterior 2026-05-07 base) |
|---|---|
| Con `Article` schema | 32 / 33 (32) |
| Con `FAQPage` schema | 25 / 33 (17) |
| Con `BreadcrumbList` | 29 / 33 (29) |
| Con `HowTo` | 6 / 33 (6) |
| Errores críticos | 0 (2) |
| Bloques JSON-LD que parsean | 100% |

**Avances en este sprint**: +8 FAQPage, +1 logo `publisher` arreglado, 5 headline/description reescritos al rango 60-110 / 140-160, 2 borradores movidos a `/drafts/`.

Artículos con schema completo (Article + FAQ + Breadcrumb + HowTo):
- `guia-tipos-tarifas-electricas-2026`
- `precio-luz-canarias-hoy`
- `precio-luz-por-hora`
- `precio-luz-iberdrola-hoy`
- `tarifas-electricas-diarias`
- `guia-apagon-prolongado`

---

## Tabla por artículo

| Slug | Article | FAQ | Breadcrumb | HowTo | Notas |
|------|:-:|:-:|:-:|:-:|---|
| bono-social-electrico-guia-completa | ✅ | ❌ | ✅ | ❌ | logo arreglado |
| como-afecta-tarifa-por-horas-a-tu-factura | ✅ | ✅ | ✅ | ❌ | – |
| como-ahorrar-precio-luz-por-horas | ✅ | ✅ | ✅ | ❌ | FAQ añadido |
| como-encontrar-tarifas-de-luz-baratas-en-2026-... | ✅ | ✅ | ✅ | ❌ | – |
| companias-electricas-mas-baratas-2026 | ✅ | ✅ | ✅ | ❌ | – |
| comparador-luz-2026-elige-la-mejor-tarifa | ✅ | ✅ | ✅ | ❌ | URL redirige 301 |
| comparador-tarifas-luz-y-gas | ✅ | ✅ | ✅ | ❌ | FAQ + headline reescrito |
| consumo-fantasma-... | ✅ | ✅ | ✅ | ❌ | FAQ + logo arreglado |
| descubre-companias-mejores-precios-luz-2024 | ✅ | ❌ | ❌ | ❌ | URL 301 a `companias-...-2026` |
| descubre-las-ventajas-de-desocuparla-... | ❌ | ❌ | ❌ | ❌ | Sin JSON-LD (decisión: dejar) |
| descubre-mejores-tarifas-luz-2026 | ✅ | ✅ | ✅ | ❌ | URL redirige 301 |
| diez-inluencers-ecologicos-... | ✅ | ✅ | ✅ | ❌ | FAQ añadido. Typo slug: dejar tal cual |
| franjas-horarias-luz-hoy | ✅ | ✅ | ✅ | ❌ | – |
| **guia-apagon-prolongado** | ✅ | ✅ | ✅ | ✅ | Schema completo |
| guia-tipos-tarifas-electricas-2026 | ✅ | ✅ | ✅ | ✅ | Schema completo |
| interpretar-graficas-precio-luz-tiempo-real | ✅ | ✅ | ✅ | ❌ | FAQ añadido |
| iva-factura-electrica | ✅ | ✅ | ✅ | ❌ | – |
| luz-barata-2026 | ✅ | ❌ | ❌ | ❌ | URL redirige 301 |
| mejor-comercializadora-pvpc | ✅ | ✅ | ✅ | ❌ | – |
| mejores-horas-electrodomesticos | ✅ | ❌ | ✅ | ❌ | headline reescrito (FAQ opcional) |
| newsletter-precio-luz-manana | ✅ | ❌ | ✅ | ❌ | headline + meta reescritos |
| nueva-clasificacion-colores-horas | ✅ | ❌ | ✅ | ❌ | headline + meta + h1 reescritos |
| nueva-direccion-web | ✅ | ❌ | ❌ | ❌ | aviso obsoleto |
| ofertas-luz-2026 | ✅ | ✅ | ✅ | ❌ | – |
| **precio-luz-canarias-hoy** | ✅ | ✅ | ✅ | ✅ | Referencia |
| precio-luz-horas-ahorrar-factura-energetica | ✅ | ✅ | ✅ | ❌ | – |
| **precio-luz-iberdrola-hoy** | ✅ | ✅ | ✅ | ✅ | Schema completo |
| **precio-luz-por-hora** | ✅ | ✅ | ✅ | ✅ | Schema completo |
| sistemas-respaldo-electrico | ✅ | ✅ | ✅ | ❌ | FAQ añadido |
| subastas-precio-luz-manana | ✅ | ✅ | ✅ | ❌ | FAQ + h1/headline/meta reescritos |
| tarifas-de-totalenergies-luz-y-gas | ✅ | ✅ | ✅ | ❌ | FAQ añadido |
| **tarifas-electricas-diarias** | ✅ | ✅ | ✅ | ✅ | Schema completo |
| tarifas-placas-solares | ✅ | ✅ | ✅ | ❌ | – |

---

## Errores críticos

Ninguno. Los dos abiertos en el audit base se cerraron en este sprint:
- `bono-social-electrico-guia-completa` — `publisher.logo.url` añadido.
- `subastas-precio-luz-manana` — headline/h1/title/description reescritos al rango y alineados.

`descubre-las-ventajas-de-desocuparla-...` sigue sin JSON-LD por decisión explícita.

---

## Próximas oportunidades (no priorizadas)

- Añadir `HowTo` a artículos con secciones tipo "5 pasos / estrategias prácticas":
  - `como-ahorrar-precio-luz-por-horas` (5 estrategias claras y secuenciales)
  - `consumo-fantasma-...` (estrategias de eliminación)
  - `sistemas-respaldo-electrico` (criterios de elección por presupuesto)
- Añadir `FAQPage` opcional a `mejores-horas-electrodomesticos` (no tiene H2-?, requiere construir Q&A desde tabla).
- Considerar `Article` (o `WebPage`) en `descubre-las-ventajas-de-desocuparla-...` si se decide reabrir.
- Revisar si tiene sentido renombrar el slug typo `diez-inluencers-...` (sigue tal cual por decisión de bajo riesgo).

---

## No-pendientes (decisiones cerradas)

- `descubre-las-ventajas-de-desocuparla-…` sin schema → **dejar tal cual**.
- 3 slugs 2026 redirigidos en `vercel.json` (`descubre-mejores-tarifas-luz-2026`, `comparador-luz-2026-…`, `luz-barata-2026`) → **mantener 301 + HTMLs en disco**.
- Borradores `precio-luz-hoy-por-horas` y `tarifas-electricas-diarias-pvpc` → **movidos a `/drafts/`** en este sprint.
- Slug typo `diez-inluencers-…` → **no tocar** (decidido en este sprint, prioridad baja).
