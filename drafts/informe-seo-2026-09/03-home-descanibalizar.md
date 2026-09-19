# Acción 3 — Home: día de la semana en el título y descanibalizar compañías

**Datos**: la home concentra 31.073 clics (marca) y 266K impr. Es la URL que posiciona en Ahrefs para "precio luz hoy" (596K vol, pos 26), "precio de la luz hoy hora a hora" (38K, pos 18), "precio luz hoy iberdrola" (25K, pos 17, CPC 4,10 €), "precio luz hoy naturgy por horas" (16K, pos 13), "pvpc hoy" (9,2K, pos 17). En GSC "precio de la luz hoy" tiene 41.438 impr, 49 clics, CTR 0,1 %, pos 9.

Las consultas con día de la semana ("precio de la luz por horas hoy jueves") convierten al 18-38 %.

La home todavía contiene una sección "Precio luz por compañía hoy" con 13 menciones a Iberdrola/Naturgy/Endesa, lo que la hace competir con los tres artículos dedicados.

**Qué hacer**
1. Title: "Precio de la luz hoy, jueves 18 de septiembre, hora a hora | Apaga Luz". H1 igual sin la marca. Generado en build/JS con fallback estático "Precio de la luz hoy hora a hora".
2. Quick Answer con precio medio de hoy, hora más barata y más cara (datos de `public/data/today_price.json`).
3. Reducir la sección de compañías a tres enlaces con anchor exacto ("precio luz hoy Iberdrola", "precio luz hoy Naturgy", "precio luz hoy Endesa") sin párrafos descriptivos ni H2 con nombres de compañías. El H2 pasa a "¿Cuánto cuesta la luz hoy con tu compañía?" solo si se mantiene; preferible eliminarlo.
4. Mantener el resto (tabla, gráfico, enlaces a mañana/gráficas/horas baratas).

**PROMPT**
```
Optimiza index.html según drafts/informe-seo-2026-09/03-home-descanibalizar.md: title y H1 con "Precio de la luz hoy, {día de la semana} {día} de {mes}, hora a hora" (fallback estático), Quick Answer con precio medio, hora más barata y hora más cara leídos de public/data/today_price.json, y reduce la sección "Precio luz por compañía hoy" a tres enlaces con anchor exacto hacia noticias/precio-luz-iberdrola-hoy/, precio-luz-naturgy-hoy/ y precio-luz-endesa-hoy/, eliminando texto descriptivo sobre esas compañías. No cambies la lógica de precios ni el layout del gráfico. /audit-schema antes y después.
```
