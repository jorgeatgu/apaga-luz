// Cálculo de INP, fases, ICP y LoAF a partir de lo que recoge `observer.mjs`.
// Método del apartado 3 del diagnóstico (docs/investigacion/inp-movil.md, fuera de git).

const round = value => Math.round(value);

export function median(values) {
  const sorted = values.filter(v => v != null).sort((a, b) => a - b);
  if (sorted.length === 0) return null;
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[middle]
    : round((sorted[middle - 1] + sorted[middle]) / 2);
}

// Agrupa por `interactionId`. INP = `duration` máxima del grupo; inputDelay =
// min(processingStart) − startTime; processing = max(processingEnd) − min(processingStart);
// presentation = lo que queda hasta el final de la entrada que más tarda en terminar.
export function interactionsFrom(store) {
  const groups = new Map();
  for (const entry of store.events) {
    const group = groups.get(entry.interactionId) ?? [];
    group.push(entry);
    groups.set(entry.interactionId, group);
  }
  return [...groups].map(([interactionId, entries]) => {
    const startTime = Math.min(...entries.map(e => e.startTime));
    const duration = Math.max(...entries.map(e => e.duration));
    // Cada entrada (pointerdown, click…) tiene su propio inicio: el fin es el más tardío.
    const end = Math.max(...entries.map(e => e.startTime + e.duration));
    const processingStart = Math.min(...entries.map(e => e.processingStart));
    const processingEnd = Math.max(...entries.map(e => e.processingEnd));
    const icps = store.icp.filter(e => e.interactionId === interactionId);
    return {
      interactionId,
      startTime: round(startTime),
      inp: round(duration),
      phases: {
        inputDelay: round(processingStart - startTime),
        processing: round(processingEnd - processingStart),
        // `duration` viene redondeada a 8 ms: sin el máximo, la resta puede salir negativa.
        presentation: round(Math.max(0, end - processingEnd))
      },
      icp: icps.length ? round(Math.max(...icps.map(e => e.duration))) : null,
      events: [...new Set(entries.map(e => e.name))]
    };
  });
}

export function worstInteraction(interactions) {
  if (interactions.length === 0) return null;
  return interactions.reduce((worst, i) => (i.inp > worst.inp ? i : worst));
}

// Resumen de una interacción a partir de sus pasadas (cada una, la peor de su pasada o null).
export function summarizeRuns(page, id, runs) {
  const measured = runs.filter(Boolean);
  const inps = measured.map(r => r.inp);
  // El ICP, con las pasadas que pintaron contenido nuevo; null solo si no lo hizo ninguna.
  const icps = measured.map(r => r.icp).filter(v => v != null);
  return {
    page,
    id,
    runs: runs.length,
    measured: measured.length,
    inp: measured.length
      ? { median: median(inps), min: Math.min(...inps), max: Math.max(...inps) }
      : null,
    phases: measured.length
      ? {
          inputDelay: median(measured.map(r => r.phases.inputDelay)),
          processing: median(measured.map(r => r.phases.processing)),
          presentation: median(measured.map(r => r.phases.presentation))
        }
      : null,
    icp: median(icps),
    icpMeasured: icps.length
  };
}

const THIRD_PARTIES = [
  [/googletagmanager\.com\/gtag\/js/, 'gtag/js'],
  [/adsbygoogle\.js/, 'adsbygoogle.js'],
  [/\/adsense\/.*\/sh/, 'adsense/…/sh']
];

// Nombre estable para un script de LoAF: terceros conocidos, ficheros propios sin hash y
// scripts en línea por su invocador (así el `onload` en línea de gtag no se suma a `gtag/js`).
export function scriptLabel(script, pageUrl) {
  const { sourceURL, invoker } = script;
  if (!sourceURL || sourceURL === pageUrl) {
    return `en línea: ${(invoker ?? '').replace(/\?[^"\]]*/, '')}`;
  }
  for (const [pattern, label] of THIRD_PARTIES) {
    if (pattern.test(sourceURL)) return label;
  }
  const url = new URL(sourceURL);
  if (url.origin !== new URL(pageUrl).origin) {
    // Otros terceros, por host y primer tramo de la ruta: el resto suele ser un token por visita.
    const [first, ...rest] = url.pathname.split('/').filter(Boolean);
    return `${url.host}/${first ?? ''}${rest.length ? '/…' : ''}`;
  }
  const file = url.pathname.split('/').pop();
  // Vite añade a los ficheros de `assets/` un hash de 8 caracteres: `main-AbC_12-z.js`.
  return url.pathname.startsWith('/assets/')
    ? file.replace(/-[\w-]{8}\.js$/, '.js')
    : file;
}

// Suma, por script, la duración en los LoAF de una pasada (por defecto, los de 50 ms o más).
export function loafByScript(frames, pageUrl, { minDuration = 50 } = {}) {
  const totals = {};
  for (const frame of frames) {
    if (frame.duration < minDuration) continue;
    for (const script of frame.scripts) {
      const label = scriptLabel(script, pageUrl);
      totals[label] = round((totals[label] ?? 0) + script.duration);
    }
  }
  return totals;
}

// Mediana por script entre pasadas; un script que no aparece en una pasada cuenta 0.
export function summarizeLoaf(perRun) {
  const labels = new Set(perRun.flatMap(totals => Object.keys(totals)));
  return [...labels]
    .map(script => {
      const values = perRun.map(totals => totals[script] ?? 0);
      return {
        script,
        median: median(values),
        max: Math.max(...values),
        runsSeen: values.filter(v => v > 0).length
      };
    })
    .sort((a, b) => b.median - a.median || b.max - a.max);
}

export const formatPhases = phases =>
  phases
    ? `${phases.inputDelay} / ${phases.processing} / ${phases.presentation}`
    : '—';
