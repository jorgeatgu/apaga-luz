# Glosario

Términos del dominio de apaga-luz que nombran piezas del código. Si un módulo se llama como uno de
estos términos, usa el término exacto.

## Rendimiento y terceros

**Medición de campo**: el módulo que mide los Core Web Vitals de los usuarios reales (CLS, LCP,
INP, FCP, TTFB) con la librería `web-vitals` y los envía a GA4, con la atribución del INP
(`inp_phase`, `load_state`, `top_script`…). Recibe la función de envío como dependencia. Es la
única medición del sitio: no hay otros observadores de Event Timing ni de tareas largas.
_Evitar_: RUM casero, monitor, optimizador.

**Módulo de terceros**: el único sitio que carga scripts de terceros (gtag de GA4 y AdSense) en
todas las páginas. Lo inyecta un plugin de Vite; los HTML no llevan copias propias.
_Evitar_: cargador de GA4, snippet.

**Política de carga de terceros**: la regla que decide cuándo entra cada tercero (hoy, gtag al
primer gesto o a los 5 s, y AdSense con `defer`). Vive dentro del módulo de terceros y se cambia
con datos de campo, no por intuición.
