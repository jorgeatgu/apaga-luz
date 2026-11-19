// Comparador de mediciones de INP (Sprint 06, fase 0).
//
// Uso:
//   npm run inp:compare -- <antes.json> <despues.json> [--tolerance=8]
//
// Recibe dos resultados de `inp:measure` o `inp:load` y compara, por interacción (página + id),
// la mediana del INP y el ICP. Termina con código 1 si alguna sube más de la tolerancia (8 ms, un
// tramo de Event Timing) o si una interacción o métrica de `antes` falta en `despues`. Las
// interacciones que solo están en `despues` se informan y no hacen fallar.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const key = interaction => `${interaction.page} ${interaction.id}`;

const METRICS = {
  inp: interaction => interaction.inp?.median ?? null,
  icp: interaction => interaction.icp ?? null
};

export function compareSummaries(base, next, { tolerance = 8 } = {}) {
  const nextByKey = new Map(next.summary.interactions.map(i => [key(i), i]));
  const regressions = [];
  const missing = [];
  for (const before of base.summary.interactions) {
    const after = nextByKey.get(key(before));
    if (!after) {
      missing.push({ page: before.page, id: before.id, metric: 'inp' });
      continue;
    }
    for (const [metric, read] of Object.entries(METRICS)) {
      const was = read(before);
      const now = read(after);
      if (was == null) continue;
      if (now == null) {
        missing.push({ page: before.page, id: before.id, metric });
        continue;
      }
      const delta = now - was;
      if (delta > tolerance) {
        regressions.push({
          page: before.page,
          id: before.id,
          metric,
          base: was,
          next: now,
          delta
        });
      }
    }
  }
  const baseKeys = new Set(base.summary.interactions.map(key));
  const added = next.summary.interactions
    .filter(i => !baseKeys.has(key(i)))
    .map(({ page, id }) => ({ page, id }));
  return {
    regressions,
    missing,
    added,
    ok: regressions.length === 0 && missing.length === 0
  };
}

function printDiff(base, next) {
  const nextByKey = new Map(next.summary.interactions.map(i => [key(i), i]));
  const rows = base.summary.interactions.map(before => {
    const after = nextByKey.get(key(before));
    const cell = (read, i) => (i && read(i) != null ? read(i) : '—');
    return {
      página: before.page,
      interacción: before.id,
      'INP antes': cell(METRICS.inp, before),
      'INP después': cell(METRICS.inp, after),
      'ICP antes': cell(METRICS.icp, before),
      'ICP después': cell(METRICS.icp, after)
    };
  });
  console.table(rows);
}

function main(argv) {
  const files = argv.filter(arg => !arg.startsWith('--'));
  const toleranceArg = argv.find(arg => arg.startsWith('--tolerance='));
  if (files.length !== 2) {
    console.error(
      'Uso: npm run inp:compare -- <antes.json> <despues.json> [--tolerance=8]'
    );
    return 2;
  }
  const [base, next] = files.map(file =>
    JSON.parse(readFileSync(file, 'utf8'))
  );
  const tolerance = toleranceArg ? Number(toleranceArg.split('=')[1]) : 8;
  const report = compareSummaries(base, next, { tolerance });

  printDiff(base, next);
  for (const r of report.regressions) {
    console.log(
      `REGRESIÓN ${r.page} ${r.id} ${r.metric}: ${r.base} → ${r.next} ms (+${r.delta})`
    );
  }
  for (const m of report.missing) {
    console.log(`FALTA ${m.page} ${m.id} ${m.metric}`);
  }
  for (const a of report.added) {
    console.log(`NUEVA ${a.page} ${a.id}`);
  }
  console.log(report.ok ? `OK: nada sube más de ${tolerance} ms.` : 'FALLA.');
  return report.ok ? 0 : 1;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  process.exitCode = main(process.argv.slice(2));
}
