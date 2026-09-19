# Acción 5 — CTR de los artículos "precio luz hoy {compañía}"

| Artículo | Clics | Impr | Pos | Consultas con CTR ~0 |
|---|---|---|---|---|
| precio-luz-iberdrola-hoy | 33 | 16.646 | 7,7 | "precio luz hoy iberdrola por horas" 3.165 impr / 6 clics; "a que hora es más barata la luz iberdrola hoy" 2.262 / 5; "precio luz hoy iberdrola" 692 / 1 |
| precio-luz-naturgy-hoy | 1 | 1.191 | 23,3 | "precio luz naturgy hoy" 1.086 / 3 (pos 9,1); "precio luz hoy naturgy por horas" 1.063 / 3 |
| precio-luz-endesa-hoy | 7 | 1.675 | 13,1 | |
| pvpc-precio-hoy-tarifa-regulada | 8 | 2.955 | 17,5 | |
| franjas-horarias-luz-hoy | 56 | 19.140 | 2,3 | title y H1 dicen "2025" |

**Qué hacer**: mismo patrón que la acción 3: title con día de la semana + dato del día ("Precio luz hoy Iberdrola, jueves 18 de septiembre: hora más barata"), Quick Answer con precio medio y hora más barata desde today_price.json, H2-pregunta "¿A qué hora es más barata la luz hoy con Iberdrola?". En franjas-horarias, sustituir 2025 por 2026 y reescribir title para la intención "franjas horarias luz hoy" (valle/llano/punta con horas de hoy).

**PROMPT**
```
Aplica drafts/informe-seo-2026-09/05-ctr-articulos-hoy.md a noticias/precio-luz-iberdrola-hoy, precio-luz-naturgy-hoy, precio-luz-endesa-hoy, pvpc-precio-hoy-tarifa-regulada y franjas-horarias-luz-hoy: title y H1 con día de la semana y dato del día, Quick Answer con datos de public/data/today_price.json (fallback estático), H2 en forma de pregunta con la compañía. En franjas-horarias-luz-hoy cambia todas las referencias a 2025 por 2026 y actualiza dateModified. /audit-schema después de cada uno.
```
