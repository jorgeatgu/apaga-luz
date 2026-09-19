# Acción 2 — /precio-luz-manana/ debe ganar el cluster "precio luz mañana"

**Datos GSC (3 meses)**: 2.450 clics, 128.791 impr, pos 19,3. Consultas objetivo:

| Consulta | Impr | Clics | CTR | Pos |
|---|---|---|---|---|
| tarifa luz mañana | 28.570 | 183 | 0,6 % | 10,0 |
| precio luz mañana | 25.974 | 169 | 0,7 % | 10,5 |
| precio de la luz mañana | 18.950 | 196 | 1,0 % | 10,2 |
| luz mañana | 3.282 | 21 | 0,6 % | 10,1 |
| el precio de la luz mañana | 1.621 | 15 | 0,9 % | 10,8 |
| precio luz mañana por horas | 1.475 | 17 | 1,2 % | 12,1 |
| pvpc mañana | 984 | 10 | 1,0 % | 9,2 |

En 2025 estas mismas consultas daban 3.576 clics. Ahrefs: "luz mañana" (9,8K vol) posiciona con esta URL en 17; "precio de la luz mañana miércoles" pos 4 con CTR alto.

**Diagnóstico**: la página está en el borde de la primera página con CTR de 1 %. Título genérico ("Precio luz mañana hora a hora | Tarifa PVPC actualizada 2026"), sin el dato que el usuario busca (día concreto, hora más barata, precio medio). Competidores en top 5 muestran el precio y el día en el título.

**Qué hacer**
1. `<title>` y H1 dinámicos con la fecha de mañana y el dato clave: "Precio de la luz mañana, viernes 19 de septiembre: hora más barata y tabla por horas". El JS que ya pinta la tabla puede escribir el título; para el crawler, el HTML estático debe llevar el texto del último build (Flat actualiza los JSON, ver si el build regenera HTML; si no, título estático "Precio de la luz mañana por horas: hora más barata, precio medio y tabla PVPC").
2. Quick Answer (40-60 palabras) encima de la tabla con: precio medio de mañana, hora más barata, hora más cara, comparación con hoy. Rellenado por JS desde `public/data/tomorrow_price.json` y con fallback estático.
3. H2-pregunta: "¿Cuál es el precio de la luz mañana hora a hora?", "¿A qué hora es más barata la luz mañana?", "¿Cuándo se publica el precio de mañana?" (20:15, ya en la meta).
4. FAQPage schema con esas 3-5 preguntas + `Dataset` schema apuntando al JSON de mañana.
5. Enlaces internos con anchor exacto "precio de la luz mañana" desde home (ya existe), horas-baratas-luz, franjas-horarias-luz-hoy, precio-luz-por-hora, tarifas-electricas-diarias, pvpc-precio-hoy-tarifa-regulada.
6. Redirect 301 de `/precio-luz-manana` (sin barra) — ver acción 4.

**PROMPT**
```
Vamos a optimizar precio-luz-manana/index.html para las consultas "precio luz mañana", "precio de la luz mañana" y "tarifa luz mañana" (100K impresiones/trimestre en posición 10 con CTR 1 %). Lee drafts/informe-seo-2026-09/02-precio-luz-manana.md y aplica los 5 puntos: title/H1 con fecha de mañana y dato clave, Quick Answer con precio medio + hora más barata + hora más cara leídos de public/data/tomorrow_price.json (con fallback estático), H2 en forma de pregunta, FAQPage + Dataset schema, y enlaces internos con anchor exacto desde las 5 páginas indicadas. Usa la skill aeo-strategy. Ejecuta /audit-schema antes y después. No toques la lógica de datos ni los estilos globales.
```
