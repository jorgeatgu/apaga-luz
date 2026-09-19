# Acción 7 — Rastreadas sin indexar

- `noticias/consumo-fantasma-identificar-eliminar-gasto-electrico-en-tu-hogar/` (último rastreo 21 ago 2026)
- `noticias/como-ahorrar-precio-luz-por-horas/` (22 jun 2026)

Google las rastrea y decide no indexarlas: contenido percibido como poco diferenciado. `como-ahorrar-precio-luz-por-horas` solapa con `precio-luz-horas-ahorrar-factura-energetica` y `horas-baratas-luz`.

**Opciones**: (a) fusionar `como-ahorrar-precio-luz-por-horas` en `precio-luz-horas-ahorrar-factura-energetica` con 301; (b) ampliar consumo-fantasma con datos concretos (W por aparato, coste anual con precio actual) + HowTo schema (ya sugerido en SCHEMA_AUDIT.md) y enlazarlo desde 3 artículos.

**PROMPT**
```
Decide y ejecuta según drafts/informe-seo-2026-09/07-indexacion.md: compara noticias/como-ahorrar-precio-luz-por-horas con precio-luz-horas-ahorrar-factura-energetica y horas-baratas-luz; si el solape es alto, fusiona en el más fuerte y añade 301 en vercel.json. Amplía consumo-fantasma con tabla de consumo por aparato y coste anual calculado con el precio medio actual, añade HowTo schema y 3 enlaces internos entrantes. Luego solicita indexación en GSC.
```
