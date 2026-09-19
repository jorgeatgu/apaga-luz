# Fase 5 — INP de la home

## Objetivo

Bajar el INP móvil de `/` (campo p75 227 ms el 18 sep, CWV "no superada") sin perder ingresos de AdSense. Parte de `drafts/INP_AUDIT_HANDOFF.md`.

## Lo que se comprobó el 19 sep 2026

- **La atribución ya se ve en producción.** `web-vitals.js` accede a `console` de forma indirecta y sobrevive a `drop_console`; con `?debug=true` la consola de `www.apaga-luz.com` imprime "INP … · pointer en button.menu-toggle", el selector y las fases. El bloqueante del handoff no existe.
- **El laboratorio en escritorio no sirve para atribuir**: menú, ordenar tabla y checkbox dan INP 0 ms sin throttling. La extensión de Chrome no permite CPU 4×. El INP de campo viene de móviles con anuncios reales, así que hay que medir en campo.
- **Google Analytics recibe el evento `INP`** desde `sendMetricToAnalytics`, pero hasta ahora solo con valor, rating y delta.
- **Hallazgo AdSense**: en la home aparecen "píldoras" inline dentro de los párrafos ("Economía", "Física", "Horario y calendarios", "Diccionarios y…") y el pegote "Aprende Economía Global" que el usuario vio pegado al Quick Answer. Son el formato **Anuncios de intención (ad intents)** de Auto Ads: Google inserta enlaces dentro del texto y, al tocarlos, abre un intersticial. Es el formato que más secuestra la interacción en móvil y el que rompe el texto del Quick Answer.
- PageSpeed Insights por API devolvió 429 (cuota diaria anónima agotada); la medición lab queda para la interfaz web, como en la fase 9 del Sprint 01.

## Cambio de código (PR de esta fase)

`source/javascript/web-vitals.js`: el evento `INP` de GA4 lleva ahora `metric_target` (selector), `inp_phase` (fase dominante: `input_delay`, `processing` o `presentation`), `input_delay`, `processing_duration`, `presentation_delay`, `load_state`, `top_script` (script con más duración en Long Animation Frames) y `page_path`.

## Tareas del usuario

1. **GA4 › Administración › Definiciones personalizadas**: crear dimensiones de evento `metric_target`, `inp_phase`, `load_state`, `top_script` y `page_path`, y métricas de evento `input_delay`, `processing_duration`, `presentation_delay` (ms). Sin registrarlas, GA4 descarta los parámetros.
2. A los 7 días: exploración en GA4 con evento `INP`, filtrado `metric_rating = poor` o `needs-improvement`, desglosado por `inp_phase` y `top_script`.
   - Si domina `input_delay` con `top_script` en `googlesyndication`/`doubleclick` → en AdSense: desactivar **Anuncios de intención** y probar **vignette** desactivado una semana manteniendo el anchor.
   - Si domina `processing` con `top_script` en `main-*.js` o `styles-*.js` → fase 3 del handoff: `inpOptimizer.createOptimizedHandler` en el menú, debounce en `handleCheckboxChange`, `chunkSize` de `loadInitialData`.
3. Independiente de la medición: **desactivar Anuncios de intención** ya es defendible por el daño al Quick Answer (texto de la respuesta partido por enlaces de anuncio, justo lo que citan los AI Overviews). Decisión del usuario.

## Tareas

- [x] Rama `fase-5-inp`
- [x] Verificar atribución en consola de producción
- [x] Enriquecer evento INP de GA4 con atribución
- [x] Build y lint (9 avisos de eslint previos, sin cambios)
- [x] PR
- [ ] Dimensiones personalizadas en GA4 (usuario)
- [ ] Decisión AdSense: anuncios de intención y vignette (usuario)
- [ ] Lectura a 7 días y siguiente paso
