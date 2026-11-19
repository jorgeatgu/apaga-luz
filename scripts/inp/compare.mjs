// Comparador de mediciones de INP (Sprint 06, fase 0).
//
// Uso:
//   npm run inp:compare -- <antes.json> <despues.json>
//
// Recibe dos resultados de `inp:measure` o `inp:load` y compara, por interacción (página + id),
// la mediana del INP y el ICP. Termina con código 1 si alguna sube más de 8 ms (un tramo de
// Event Timing) o si una interacción o métrica de `antes` falta en `despues`. Lo que solo está en
// `despues` (una interacción, o una métrica que en `antes` no se midió) se informa y no hace
// fallar.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export const TOLERANCE_MS = 8;

const key = interaction => `${interaction.page} ${interaction.id}`;
const byKey = result =>
  new Map(result.summary.interactions.map(i => [key(i), i]));

const METRICS = {
  inp: interaction => interaction.inp?.median ?? null,
  icp: interaction => interaction.icp ?? null
};

export function compareSummaries(base, next) {
  const nextByKey = byKey(next);
  const regressions = [];
  const missing = [];
  const added = [];
  for (const before of base.summary.interactions) {
    const { page, id } = before;
    const after = nextByKey.get(key(before));
    if (!after) {
      missing.push({ page, id, metric: 'inp' });
      continue;
    }
    for (const [metric, read] of Object.entries(METRICS)) {
      const was = read(before);
      const now = read(after);
      if (was == null) {
        if (now != null) added.push({ page, id, metric });
      } else if (now == null) {
        missing.push({ page, id, metric });
      } else if (now - was > TOLERANCE_MS) {
        regressions.push({
          page,
          id,
          metric,
          base: was,
          next: now,
          delta: now - was
        });
      }
    }
  }
  const baseByKey = byKey(base);
  for (const { page, id } of next.summary.interactions) {
    if (!baseByKey.has(key({ page, id }))) added.push({ page, id });
  }
  return {
    regressions,
    missing,
    added,
    ok: regressions.length === 0 && missing.length === 0
  };
}

function printDiff(base, next) {
  const nextByKey = byKey(next);
  const shown = (read, interaction) =>
    interaction && read(interaction) != null ? read(interaction) : '—';
  console.table(
    base.summary.interactions.map(before => {
      const after = nextByKey.get(key(before));
      return {
        página: before.page,
        interacción: before.id,
        'INP antes': shown(METRICS.inp, before),
        'INP después': shown(METRICS.inp, after),
        'ICP antes': shown(METRICS.icp, before),
        'ICP después': shown(METRICS.icp, after)
      };
    })
  );
}

function main(files) {
  if (files.length !== 2) {
    console.error('Uso: npm run inp:compare -- <antes.json> <despues.json>');
    return 2;
  }
  const [base, next] = files.map(file =>
    JSON.parse(readFileSync(file, 'utf8'))
  );
  const report = compareSummaries(base, next);

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
    console.log(`NUEVA ${a.page} ${a.id}${a.metric ? ` ${a.metric}` : ''}`);
  }
  console.log(
    report.ok ? `OK: nada sube más de ${TOLERANCE_MS} ms.` : 'FALLA.'
  );
  return report.ok ? 0 : 1;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  process.exitCode = main(process.argv.slice(2));
}
