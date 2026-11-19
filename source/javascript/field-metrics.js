// Atribución del INP (web-vitals/attribution v5) → parámetros del evento `INP` de GA4. En GA4
// están registrados como dimensiones de evento: metric_target, inp_phase, load_state y
// top_script; los tres tiempos van como métricas.
export function inpParams(attribution) {
  const phases = {
    input_delay: attribution.inputDelay,
    processing: attribution.processingDuration,
    presentation: attribution.presentationDelay
  };
  const dominant = Object.keys(phases).reduce((best, phase) =>
    phases[phase] > phases[best] ? phase : best
  );
  const script = attribution.longestScript?.entry;
  const topScript =
    script && (script.sourceURL || script.invoker || script.invokerType);
  return {
    metric_target: String(attribution.interactionTarget || 'unknown').slice(
      0,
      100
    ),
    inp_phase: dominant,
    input_delay: Math.round(attribution.inputDelay),
    processing_duration: Math.round(attribution.processingDuration),
    presentation_delay: Math.round(attribution.presentationDelay),
    load_state: attribution.loadState,
    top_script: topScript ? String(topScript).slice(0, 100) : 'none'
  };
}

export const isDebug = location =>
  new URLSearchParams(location.search).get('debug') === 'true';

// Medición de campo: registra las cinco métricas y entrega cada una a `send(nombre, parámetros)`.
// No importa la librería: recibe sus `onX`. En local solo arranca con `?debug=true`.
// Devuelve si ha arrancado.
export function startFieldMetrics({
  onCLS,
  onLCP,
  onINP,
  onFCP,
  onTTFB,
  send,
  location
}) {
  const local =
    location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  const debug = isDebug(location);
  if (local && !debug) return false;

  const report = metric =>
    send(metric.name, {
      value: Math.round(
        metric.name === 'CLS' ? metric.value * 1000 : metric.value
      ),
      metric_rating: metric.rating,
      metric_delta: metric.delta,
      non_interaction: true,
      page_path: location.pathname,
      ...(metric.name === 'INP' ? inpParams(metric.attribution) : {})
    });
  // Todas las sesiones, sin muestreo: el p75 de GA4 tiene que poder compararse con CrUX.
  onCLS(report);
  onLCP(report);
  // En debug, cada interacción; si no, el INP de la visita al ocultar la página.
  onINP(report, { reportAllChanges: debug });
  onFCP(report);
  onTTFB(report);
  return true;
}
