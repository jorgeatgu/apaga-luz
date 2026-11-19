// Observadores que se inyectan en la página antes de que cargue (`page.addInitScript`).
// Acumulan en `window.__inp` las entradas de Event Timing, LoAF e ICP para leerlas después.
// La función se serializa: no puede usar nada de fuera de su cuerpo.

export function installObservers() {
  const store = { events: [], loaf: [], icp: [] };
  window.__inp = store;

  const observe = (type, options, sink) => {
    if (!PerformanceObserver.supportedEntryTypes?.includes(type)) return;
    new PerformanceObserver(list => {
      for (const entry of list.getEntries()) sink(entry);
    }).observe({ type, buffered: true, ...options });
  };

  const eventSink = entry => {
    if (!entry.interactionId) return;
    store.events.push({
      name: entry.name,
      interactionId: entry.interactionId,
      startTime: entry.startTime,
      duration: entry.duration,
      processingStart: entry.processingStart,
      processingEnd: entry.processingEnd
    });
  };
  observe('event', { durationThreshold: 16 }, eventSink);
  // El primer toque de cada contexto llega aquí aunque dure menos de 16 ms.
  observe('first-input', {}, eventSink);

  observe('long-animation-frame', {}, entry => {
    store.loaf.push({
      startTime: entry.startTime,
      duration: entry.duration,
      blockingDuration: entry.blockingDuration,
      renderStart: entry.renderStart,
      styleAndLayoutStart: entry.styleAndLayoutStart,
      // Separan recálculo de estilos y layout en la presentación (con alternativa combinada).
      styleDuration: entry.styleDuration,
      layoutDuration: entry.layoutDuration,
      scripts: entry.scripts.map(script => ({
        sourceURL: script.sourceURL,
        sourceFunctionName: script.sourceFunctionName,
        invoker: script.invoker,
        invokerType: script.invokerType,
        duration: script.duration,
        forcedStyleAndLayoutDuration: script.forcedStyleAndLayoutDuration,
        forcedStyleDuration: script.forcedStyleDuration,
        forcedLayoutDuration: script.forcedLayoutDuration
      }))
    });
  });

  // Emite entradas cada vez mayores por interacción: el ICP es la mayor.
  observe('interaction-contentful-paint', {}, entry => {
    store.icp.push({
      interactionId: entry.interactionId,
      startTime: entry.startTime,
      duration: entry.duration
    });
  });
}
