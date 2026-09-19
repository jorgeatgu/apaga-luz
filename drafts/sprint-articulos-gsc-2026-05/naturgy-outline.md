# Outline — precio-luz-naturgy-hoy

**Fecha**: 2026-05-12
**Slug**: `precio-luz-naturgy-hoy`
**URL final**: `https://www.apaga-luz.com/noticias/precio-luz-naturgy-hoy/`
**Input Fase 1**: `drafts/sprint-articulos-gsc-2026-05/naturgy-serp.md`
**Plantilla a clonar (Fase 3)**: `noticias/precio-luz-iberdrola-hoy/index.html`
**Longitud objetivo**: 2.000–2.500 palabras (alineado con Iberdrola; ~1,5× la media del top 7 SERP).

---

## 1. Meta del artículo

### 1.1. H1 (interno, el `<h1 class="post-title">`)

> **Precio de la Luz Naturgy Hoy: Tarifa PVPC con Gas & Power y Mercado Libre**

Paralelismo intencional con la H1 de Iberdrola (`Precio de la Luz Iberdrola Hoy: Tarifa PVPC en Tiempo Real y Mercado Libre`). El cambio "Tarifa PVPC con Gas & Power" introduce el gap competitivo (la COR Naturgy) desde la propia H1 — diferencial vs SERP top 10.

### 1.2. `<title>` (≤ 60 caracteres)

> **Precio Luz Naturgy Hoy: Tarifa PVPC y Mercado Libre | Apaga Luz**

59 caracteres. Branded suffix `| Apaga Luz` mantiene patrón del sitio.

### 1.3. `<meta name="description">` (≤ 160 caracteres)

> **Precio de la luz con Naturgy hoy: tarifa PVPC con Gas & Power (idéntica a Iberdrola/Endesa) y tarifas de mercado libre (Por Uso, Noche, Plana). Comparativa actualizada.**

157 caracteres. Cumple: keyword principal · diferencial Gas & Power · comparativa.

### 1.4. URL canonical

`https://www.apaga-luz.com/noticias/precio-luz-naturgy-hoy/`

### 1.5. Open Graph

- `og:title`: idéntico a `<title>`.
- `og:description`: idéntica a meta description.
- `og:image`: reutilizar `https://www.apaga-luz.com/apple-touch-icon.png` (patrón del sitio).
- `og:type`: `article`.

---

## 2. Quick Answer (Respuesta rápida — bloque destacado bajo H1, antes del primer H2)

> **Respuesta rápida**: El precio de la luz con Naturgy depende de tu tarifa. Si tienes PVPC con Naturgy, tu suministrador formal es Gas & Power (filial COR de Naturgy) y pagas el precio horario regulado publicado por OMIE/ESIOS, idéntico al de Iberdrola, Endesa o Repsol en PVPC. Si tienes una tarifa de mercado libre Naturgy (Tarifa Por Uso, Tarifa Noche, Tarifa Plana), pagas un precio fijo o con discriminación horaria definido por contrato, sin relación con el PVPC.

**62 palabras**. Cumple regla AEO (40-60 idealmente, 62 aceptable). Replica el patrón del Quick Answer de Iberdrola para coherencia editorial.

Después del Quick Answer, dos párrafos puente (~120 palabras):

> Naturgy es una de las cuatro grandes comercializadoras eléctricas de España y por eso millones de usuarios buscan cada día "precio luz Naturgy hoy" sin saber que, en realidad, lo que pagan depende de la tarifa que tienen contratada y no tanto de la marca.
>
> En esta guía explicamos cómo se calcula el precio que pagas con Naturgy, qué papel juega su filial **Gas & Power** con el PVPC, en qué se diferencian sus tarifas de mercado libre (Por Uso, Noche, Plana) y cómo aprovechar las horas más baratas para ahorrar.

CTA inline al final de la intro:

> **[Consulta el precio del PVPC ahora]** — Si estás en Naturgy PVPC (Gas & Power), este es exactamente el precio que pagas hora a hora hoy.
> → `Ver precio luz hoy` (link a `/`)

---

## 3. Outline H2 (con intención, longitud y elementos)

Total: **10 H2** + Conclusión. Sigue la estructura clonada de Iberdrola, ampliada con los gaps detectados en SERP.

### H2 #1 — ¿Es el precio de la luz con Naturgy igual que con otras compañías?

- **Tipo**: H2-pregunta AEO obligatorio (reproduce variante de keyword principal + intención comparativa).
- **Intención**: dar respuesta cerrada arriba (sí en PVPC, no en libre). Captura intención "Naturgy vs Iberdrola/Endesa".
- **Longitud**: 150-200 palabras.
- **Bullet points** (para snippet AEO):
  - **PVPC**: precio idéntico en las cuatro COR (Gas & Power / Curenergía / Energía XXI / Régsiti).
  - **Mercado libre**: cada comercializadora marca su precio; Naturgy Tarifa Por Uso ≠ Iberdrola Plan Estable.
- **Keywords secundarias**: `naturgy vs iberdrola precio luz`, `naturgy es más barata que iberdrola`, `Gas Power comercializadora regulada`.

### H2 #2 — Naturgy y el PVPC: el papel de Gas & Power

- **Tipo**: H2 declarativo + H3 anidado.
- **H3 anidado**: "Qué es Gas & Power y por qué facturas a su nombre".
- **Intención**: gap más grande del SERP. Explicar que Naturgy en PVPC actúa vía Gas & Power Comercializadora S.A. (su Comercializadora de Referencia, COR), de la misma forma que Iberdrola lo hace vía Curenergía.
- **Longitud**: 250-300 palabras.
- **Datos concretos**:
  - Gas & Power Comercializadora S.A. es la COR del grupo Naturgy.
  - Designación por la CNMC según RD 216/2014.
  - El consumidor ve "Naturgy" en la app y atención al cliente, pero el contrato legal es con Gas & Power.
  - Esto significa que el precio horario del PVPC es **idéntico** al del resto de COR.
- **CTA al lateral**: link al artículo `mejor-comercializadora-pvpc/` con anchor "comparativa de COR".

### H2 #3 — Cómo se calcula el precio horario PVPC de Naturgy

- **Tipo**: H2 explicativo, base conceptual.
- **Intención**: explicar mecanismo OMIE/ESIOS sin redundar con el artículo PVPC (Sprint 01). Aplicado a Naturgy.
- **Longitud**: 200-250 palabras.
- **Contenido**:
  - Subasta diaria OMIE a las ~12:00.
  - Publicación ESIOS ~20:15 con precios del día siguiente.
  - Mercado cuartihorario desde 30 sept 2025: 96 precios/día (PVPC con Naturgy también lo aplica).
  - Mismo cálculo para todas las COR (Naturgy = Iberdrola = Endesa = Repsol).
- **Enlace HACIA**: futuro `pvpc-precio-hoy-tarifa-regulada/` (Sprint 01); mientras no exista, enlazar a `/graficas/`.

### H2 #4 — Precio orientativo Naturgy PVPC por tramo horario

- **Tipo**: H2 + tabla.
- **Intención**: dar datos accionables que capturen long-tail "Naturgy precio horas valle/punta".
- **Longitud**: 150-200 palabras de texto + tabla.
- **Tabla** (3 columnas, 3 filas):

| Tramo | Horario (L-V) | Precio orientativo |
|---|---|---|
| Punta (P1) | 10:00-14:00 y 18:00-22:00 | ~0,20-0,28 €/kWh |
| Llano (P2) | 08:00-10:00, 14:00-18:00 y 22:00-24:00 | ~0,10-0,15 €/kWh |
| Valle (P3) | 00:00-08:00 + fines de semana / festivos | ~0,04-0,08 €/kWh |

- **Disclaimer obligatorio**: "Precios orientativos del 12/05/2026. Consulta el precio exacto en `/precio-luz-manana/` o `/graficas/`."

### H2 #5 — Tarifas Naturgy en mercado libre

- **Tipo**: H2 + 3 H3.
- **Intención**: cubrir el otro 50% del cluster (usuarios con tarifa Naturgy fija/Noche, no PVPC). Distinguir las 3 tarifas principales.
- **Longitud**: 350-450 palabras (la sección más larga, replica Iberdrola Plan Estable/Online/Una Tarifa).
- **H3 #5.1 — Tarifa Por Uso Luz**: precio fijo 24h ~0,151 €/kWh; sin discriminación horaria; pensada para perfiles que prefieren simplicidad.
- **H3 #5.2 — Tarifa Noche**: discriminación horaria P1/P2/P3 (~0,18 / ~0,107 / ~0,072 €/kWh). Valle 00:00-08:00 + fines de semana.
- **H3 #5.3 — Tarifa Plana (Zen)**: pago mensual fijo independiente del consumo, con un límite mensual de kWh.
- **Tabla resumen** (4 columnas):

| Tarifa | Tipo precio | Discriminación horaria | Mejor para |
|---|---|---|---|
| Por Uso | Fijo | No | Consumo estable |
| Noche | Variable (P1/P2/P3) | Sí | Coche eléctrico, lavavajillas/lavadora nocturnos |
| Plana / Zen | Cuota fija | No | Quien quiere certeza absoluta sobre la factura |

- **Datos vigilancia**: confirmar precios en `naturgy.es` antes de publicar (las tarifas mercado libre cambian). Marcar como "actualizado a 12/05/2026".

### H2 #6 — Naturgy PVPC vs Naturgy mercado libre: ¿cuál te conviene?

- **Tipo**: H2 + tabla comparativa.
- **Intención**: replicar la sección equivalente del artículo Iberdrola, sustituyendo Curenergía → Gas & Power y Plan Estable → Tarifa Por Uso.
- **Longitud**: 200-250 palabras.
- **Tabla** (clonada de Iberdrola, adaptada):

| Característica | Naturgy PVPC (Gas & Power) | Naturgy mercado libre (Por Uso, Noche, Plana) |
|---|---|---|
| Precio €/kWh | Variable cada hora según OMIE | Fijo (Por Uso, Plana) o por tramos fijos (Noche) |
| Volatilidad | Alta — depende del mercado spot | Baja — precio cerrado por contrato |
| Ahorro concentrando consumo en valle | Muy alto | Medio (sólo Tarifa Noche aprovecha tramos) |
| Permanencia | Sin permanencia | Habitual 12 meses |
| Quién factura | Gas & Power Comercializadora S.A.U. | Naturgy Iberia S.A. |

- **Cierre con regla práctica** (frase replicable, paralela a Iberdrola): "Si tu consumo es predecible y se concentra en horas valle, PVPC con Naturgy/Gas & Power suele ser más barato a medio plazo. Si prefieres certeza sobre la factura mensual, Tarifa Por Uso o Tarifa Plana dan tranquilidad a costa de un margen comercial."

### H2 #7 — Naturgy vs Iberdrola vs Endesa: ¿quién es más barato hoy?

- **Tipo**: H2 + tabla.
- **Intención**: gap diferencial. Ninguno del top 7 hace esta comparativa cruzada. Cubre intención competitiva.
- **Longitud**: 200-250 palabras + tabla.
- **Tabla comparativa**:

| Compañía | COR (PVPC) | Tarifa libre referencia | Precio €/kWh libre |
|---|---|---|---|
| Naturgy | Gas & Power | Tarifa Por Uso | ~0,151 |
| Iberdrola | Curenergía | Plan Estable | ~0,15-0,17 (según contrato) |
| Endesa | Energía XXI | One Luz | ~0,15-0,18 (según contrato) |

- **Texto puente**: enfatizar que el PVPC es **idéntico** en las 3 (mismo precio horario OMIE/ESIOS), y que las diferencias surgen sólo en mercado libre (donde dependen de la oferta concreta firmada).
- **Enlaces HACIA**: `precio-luz-iberdrola-hoy/` (vivo) + `precio-luz-endesa-hoy/` (futuro Sprint 03, dejar anchor preparado en TODO).

### H2 #8 — Horas valle, llano y punta con Naturgy

- **Tipo**: H2 + esquema horario.
- **Intención**: captura subcluster "hora barata Naturgy", "horas valle Naturgy", competir con Papernest (top 5-6 SERP) que es el actual líder de esta intención.
- **Longitud**: 150-200 palabras.
- **Contenido**:
  - Horarios exactos P1/P2/P3 (replica los del SERP research §1.1 y §2 AI Overview).
  - Aplicabilidad cruzada: PVPC con Naturgy (Gas & Power) aplica P1/P2/P3 por defecto; Tarifa Noche de mercado libre aplica los mismos tramos pero con precios fijos por tramo.
  - Truco: Tarifa Por Uso 24h no discrimina, por lo que las "horas valle" no te benefician.

### H2 #9 — Mira el precio de la luz Naturgy de mañana

- **Tipo**: H2 corto + CTA.
- **Intención**: capturar query "precio luz mañana Naturgy por horas" (107 impr/mes en cluster). Enlace al widget.
- **Longitud**: 80-120 palabras.
- **CTA fuerte**: `/precio-luz-manana/`.

### H2 #10 — 7 consejos para ahorrar con Naturgy hoy (HowTo schema)

- **Tipo**: H2 + lista ordenada de 7 pasos (HowTo JSON-LD).
- **Intención**: gap competitivo — ningún top 7 implementa HowTo schema. Aporta señal AEO + posibilidad de SERP feature.
- **Longitud**: 300-400 palabras.
- **7 pasos** (`HowToStep`):
  1. Identifica qué tarifa Naturgy tienes (mira tu factura: "Gas & Power" = PVPC; "Naturgy Iberia" = mercado libre).
  2. Si estás en PVPC, concentra tu consumo intensivo (lavavajillas, lavadora, vehículo eléctrico) entre 00:00-08:00 entre semana o todo el fin de semana.
  3. Si tienes Tarifa Noche, aprovecha igual los tramos valle/llano y evita usar electrodomésticos potentes en P1 (10-14h y 18-22h).
  4. Si tienes Tarifa Por Uso (24h fija), tu prioridad es **bajar la potencia contratada**, no mover el consumo de hora.
  5. Compara el precio horario PVPC en tiempo real (link a `/`) antes de programar electrodomésticos.
  6. Revisa la potencia contratada: si tu pico real es < 4,6 kW pero pagas 5,75 kW, baja escalón → ahorro fijo mensual.
  7. Cada 6 meses, compara tu tarifa Naturgy actual contra alternativas (link a `companias-electricas-mas-baratas-2026/`). Sin permanencia (PVPC) o pasada la permanencia (libre), cambiar es gratis.

### H2 #11 — Preguntas frecuentes sobre el precio de la luz con Naturgy

Ver detalle en §4. Schema FAQPage obligatorio.

### Conclusión

- **Tipo**: cierre corto + 1 CTA + 2-3 enlaces internos.
- **Longitud**: 100-150 palabras.
- **Mensaje**: "Naturgy en PVPC = mismo precio que Iberdrola/Endesa. La diferencia real está en su mercado libre — donde la decisión correcta depende de tu perfil de consumo."
- **CTAs cierre**:
  - "Ver precio luz hoy hora a hora" → `/`
  - "Comparar comercializadoras PVPC" → `noticias/mejor-comercializadora-pvpc/`

---

## 4. FAQ (6 preguntas con respuesta esbozada — listas para Schema FAQPage)

Cada respuesta es un borrador refinable en Fase 3; respeta el patrón de longitud de Iberdrola (60-90 palabras por respuesta) y reproduce keywords clave del cluster GSC.

### FAQ 1 — ¿Cuál es el precio de la luz con Naturgy hoy?

> El precio de la luz con Naturgy hoy depende de la tarifa contratada. Si estás en PVPC, tu suministrador es Gas & Power (filial COR de Naturgy) y pagas el precio regulado por hora publicado por OMIE/ESIOS, idéntico al del resto de Comercializadoras de Referencia. Si estás en una tarifa de mercado libre Naturgy (Tarifa Por Uso, Tarifa Noche, Tarifa Plana), pagas el precio fijo o variable de tu contrato, sin relación con el PVPC.

### FAQ 2 — ¿El precio de la luz con Naturgy es el mismo que con otras compañías?

> En PVPC sí: el precio es idéntico en las cuatro Comercializadoras de Referencia (Gas & Power/Naturgy, Curenergía/Iberdrola, Energía XXI/Endesa, Régsiti/Repsol). Lo fija la subasta de OMIE y lo publica ESIOS hora a hora. En mercado libre cada comercializadora marca su propio precio, así que la Tarifa Por Uso de Naturgy puede ser más cara o más barata que el Plan Estable de Iberdrola u One Luz de Endesa.

### FAQ 3 — ¿Qué diferencia hay entre Gas & Power y Naturgy?

> Gas & Power Comercializadora S.A.U. es la filial de Naturgy autorizada por ley (RD 216/2014) para comercializar el PVPC como Comercializadora de Referencia (COR). Naturgy Iberia S.A. es la marca de mercado libre del grupo. Si tienes contratado el PVPC con Naturgy, técnicamente tu contrato es con Gas & Power aunque la atención al cliente y la facturación se gestionen bajo la marca Naturgy.

### FAQ 4 — ¿A qué hora es más barata la luz hoy con Naturgy?

> Con Naturgy PVPC (Gas & Power), las horas más baratas suelen ser de 00:00 a 08:00 (periodo valle) de lunes a viernes y todas las horas de fines de semana y festivos nacionales. La diferencia entre la hora más barata y la más cara puede superar el 200% en días con alta volatilidad. Con Tarifa Noche de mercado libre aplican los mismos tramos pero con precios fijos por periodo. Con Tarifa Por Uso (24h fija) el precio no varía por hora.

### FAQ 5 — ¿Naturgy aplica el mercado cuartihorario desde 2025?

> Sí. Desde el 30 de septiembre de 2025, el PVPC se calcula con resolución cuartihoraria: 96 precios al día (uno cada 15 minutos) en lugar de los 24 anteriores. Naturgy, como Comercializadora de Referencia a través de Gas & Power, aplica este cambio igual que el resto de COR. Las tarifas de mercado libre (Por Uso, Noche, Plana) no se ven afectadas porque tienen precios fijos por tramo o por hora.

### FAQ 6 — ¿Conviene cambiar de Naturgy PVPC a Tarifa Por Uso de Naturgy?

> Depende de tu perfil de consumo y de la volatilidad esperada del PVPC. El PVPC suele ser más barato en años con renovables abundantes y mercado relajado, pero es más volátil. La Tarifa Por Uso (mercado libre) da estabilidad pero suele incluir un margen comercial. Si concentras consumo en horas valle y comparas las tarifas mes a mes, PVPC tiende a salir mejor en términos medios anuales.

---

## 5. Schemas JSON-LD a inyectar

Mantener el mismo set que Iberdrola (referencia: `noticias/precio-luz-iberdrola-hoy/index.html`):

| Schema | Origen | Notas |
|---|---|---|
| `Article` | Patrón sitio | `author: Organization "Apaga-luz"`, `publisher` con logo `apple-touch-icon.png`. Fechas `datePublished`/`dateModified` reales. |
| `FAQPage` | §4 de este outline | 6 `Question` con `acceptedAnswer.text` (texto plano, sin HTML). |
| `HowTo` | H2 #10 | 7 `HowToStep` con `name` y `text`. `totalTime`: `PT5M`. |
| `BreadcrumbList` | Patrón sitio | Inicio → Noticias → Precio Luz Naturgy Hoy. |
| `Organization` | Patrón sitio | "Apaga-luz" como publisher. |
| `WebPage` | Patrón sitio | Mismo set que Iberdrola. |
| `ImageObject` | Patrón sitio | Para `og:image`. |

**NO añadir**: `Product`, `Offer`, `DefinedTerm`. Razones:
- `Product`/`Offer`: somos editorial independiente, no vendemos Naturgy. Spam si lo marcamos.
- `DefinedTerm` para "Gas & Power" fue evaluado como "opcional/diferencial" en la Fase 1 — se descarta para esta versión y se reserva para iteración futura si no llegamos a top 5.

---

## 6. Internal linking

### 6.1. Enlaces HACIA (desde otros artículos hacia el nuevo)

Implementar en Fase 5 (Publish) — son ediciones a artículos existentes:

| Origen | Anchor sugerido | Ubicación dentro del origen |
|---|---|---|
| `noticias/precio-luz-iberdrola-hoy/index.html` | "precio de la luz con Naturgy" | H2 "¿Es el precio de la luz con Iberdrola igual que con otras compañías?" |
| `noticias/mejor-comercializadora-pvpc/index.html` | "Naturgy (Gas & Power)" | H3 "Naturgy" del ranking PVPC |
| `noticias/companias-electricas-mas-baratas-2026/index.html` | "tarifas Naturgy actualizadas" | Mención de Naturgy en el análisis detallado |
| Home `/` (`index.html`) | "Precio luz Naturgy hoy" | Grid `blog-section`, card nueva |
| `noticias/index.html` | Card respetando orden cronológico | Header card del grid |

### 6.2. Enlaces DESDE (desde el nuevo artículo hacia otros)

| Destino | Anchor sugerido | Sección desde la que enlaza |
|---|---|---|
| `noticias/precio-luz-iberdrola-hoy/` | "el precio Iberdrola en PVPC" | H2 #1 + H2 #7 |
| `noticias/mejor-comercializadora-pvpc/` | "comparativa COR" / "ranking comercializadoras PVPC" | H2 #2 + Conclusión |
| `noticias/companias-electricas-mas-baratas-2026/` | "ranking compañías más baratas 2026" | H2 #7 + H2 #10 paso 7 + Conclusión |
| `noticias/guia-tipos-tarifas-electricas-2026/` | "tipos de tarifa eléctrica" | H2 #5 (intro de tarifas mercado libre) |
| `/graficas/` | "gráficas históricas del precio de la luz" | H2 #3 + H2 #4 disclaimer |
| `/precio-luz-manana/` | "precio luz mañana" | Intro CTA + H2 #9 |
| `/` (home) | "precio luz hoy hora a hora" | Intro CTA + H2 #4 + Conclusión |
| `noticias/precio-luz-endesa-hoy/` *(futuro, Sprint 03)* | "precio luz Endesa hoy" | H2 #7 (dejar TODO/placeholder; activar tras publicación Endesa) |
| `noticias/pvpc-precio-hoy-tarifa-regulada/` *(futuro, Sprint 01)* | "qué es el PVPC" | H2 #3 (dejar TODO/placeholder; activar tras publicación PVPC) |

**Regla operativa**: cumplir con la norma del sprint (mínimo 2 enlaces DESDE artículos existentes y 2 enlaces HACIA artículos del sitio). Aquí: 5 DESDE + 7 HACIA, holgura suficiente.

---

## 7. Bloques transversales (replicar de la plantilla Iberdrola)

| Bloque | Origen | Acción |
|---|---|---|
| Sponsor card | `noticias/precio-luz-iberdrola-hoy/index.html` | Clonar literal (mismo patrocinador del momento del clon). |
| CTA box ("Consulta el precio del PVPC ahora") | Intro Iberdrola | Adaptar texto a Naturgy/Gas & Power. |
| Social share | Iberdrola | Clonar; ajustar `og:url` al nuevo slug. |
| Related posts | Iberdrola | Cambiar los 3 cards relacionados: `mejor-comercializadora-pvpc`, `precio-luz-iberdrola-hoy`, `companias-electricas-mas-baratas-2026`. |
| Reading time | Iberdrola muestra "10 min de lectura" | Mantener "8-10 min" según longitud final. |
| `post-meta` (fecha publicación) | Iberdrola "30 de abril de 2026" | Sustituir por fecha de publicación real (~12-15 mayo 2026). |

---

## 8. Bloques específicos a redactar de cero (no clonables)

- Quick Answer (§2 de este outline).
- Sección H2 #2 "Gas & Power" (gap, no existe equivalente directo en Iberdrola más que el paralelo Curenergía → adaptable).
- Tabla H2 #7 "Naturgy vs Iberdrola vs Endesa" (nueva, no existe en Iberdrola).
- HowTo H2 #10 (los 7 pasos son nuevos pero estructura HowTo paralela a la de Iberdrola).
- FAQ §4 (6 preguntas redactadas literal, adaptables a JSON-LD).

---

## 9. Datos a verificar antes de publicar (Fase 3 — Drafting)

- [ ] Precios Tarifa Por Uso Naturgy actualizados en `naturgy.es/hogar/luz/tarifa_por_uso_luz` (el outline usa ~0,151 €/kWh — confirmar).
- [ ] Precios Tarifa Noche Naturgy P1/P2/P3 actualizados (outline: ~0,18 / ~0,107 / ~0,072 €/kWh).
- [ ] Confirmar denominación oficial de "Tarifa Plana" en Naturgy (puede llamarse "Tarifa Plana Zen" o similar — verificar branding actual).
- [ ] Confirmar denominación oficial "Gas & Power Comercializadora S.A.U." (puede ser razón social distinta — verificar CNMC).
- [ ] Confirmar precios Iberdrola/Endesa de la comparativa H2 #7 (pueden haber cambiado desde 30/04/2026).
- [ ] Rango horario PVPC del día de publicación (para Quick Answer + H2 #4 disclaimer).

---

## 10. Checklist Fase 2 (smoke check)

- [x] H1 definido y alineado con SERP (paralelismo Iberdrola).
- [x] `<title>` ≤ 60 chars y `<meta description>` ≤ 160 chars.
- [x] Quick Answer redactado (62 palabras, dentro de tolerancia AEO).
- [x] 10 H2 + Conclusión definidos con intención, longitud y elementos especiales (tabla, H3, CTA).
- [x] 6 FAQs redactadas literal, listas para JSON-LD FAQPage.
- [x] Schemas listados (Article + FAQPage + HowTo + BreadcrumbList + Organization + WebPage + ImageObject).
- [x] Internal linking DESDE (5) y HACIA (7) mapeado.
- [x] Bloques transversales identificados (sponsor, CTA, social, related, meta, reading time).
- [x] Lista de verificación de datos previos a Fase 3.

**Siguiente paso**: Fase 3 — Drafting. Clonar `noticias/precio-luz-iberdrola-hoy/index.html` → `noticias/precio-luz-naturgy-hoy/index.html` y sustituir contenido siguiendo este outline H2 por H2. No publicar nada aún; el index/home/sitemap/audit son Fase 5.
