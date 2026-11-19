// Medidor de INP e ICP con la página ya cargada (Sprint 06, fase 0).
//
// Uso:
//   npm run inp:measure -- [--out=<fichero.json>] [--runs=5] [--page=/ruta/] [--target=<URL>]
//                          [--skip-build]
//
// Sin `--target` hace un build de producción en una carpeta temporal y lo sirve con
// `vite preview` en el puerto 4173. Con `--target=https://www.apaga-luz.com` mide producción.
// Cada pasada: contexto nuevo de Chromium con `devices['Pixel 7']` y CPU a 4×; carga (`load` +
// `networkidle` de hasta 4 s), lleva el elemento a la vista, espera 2,5 s y lo toca con
// `touchscreen.tap`. Las pasadas van en serie e intercaladas (la 1 de todas las interacciones,
// luego la 2…), y se da la mediana (5 por defecto). Las páginas y los selectores están en
// `pages.mjs`. Por defecto escribe en docs/sprints/06/medicion/; para la línea base de una fase,
// `--out=docs/sprints/06/medicion/fase-N-{antes,despues}.json`.
//
// Antes de tocar se espera a que haya cargado `gtag/js` (lo dispara el `scroll` o el temporizador
// de 5 s): su frame de ~165 ms no debe caer en el toque. La tabla de `/precio-luz-manana/` solo
// se ve con datos de mañana (llegan al repo hacia las 13:30 de Madrid): antes, sus interacciones
// salen como «oculto» y el comparador las señala.

import { parseArgs } from 'node:util';

import {
  defaultOut,
  launchBrowser,
  openPage,
  readStore,
  runMeta,
  sleep,
  startTarget,
  tapCenter,
  waitForGtag,
  writeResult
} from './harness.mjs';
import {
  formatPhases,
  interactionsFrom,
  scriptLabel,
  summarizeRuns,
  worstInteraction
} from './metrics.mjs';
import { PAGES } from './pages.mjs';

const { values: args } = parseArgs({
  options: {
    out: { type: 'string' },
    runs: { type: 'string', default: '5' },
    page: { type: 'string' },
    target: { type: 'string' },
    'skip-build': { type: 'boolean', default: false }
  }
});

async function measureOnce(browser, url, interaction) {
  const { context, page } = await openPage(browser);
  try {
    await page.goto(url, { waitUntil: 'load', timeout: 60000 });
    await page
      .waitForLoadState('networkidle', { timeout: 4000 })
      .catch(() => {});
    const element = page.locator(interaction.selector).first();
    if ((await element.count()) === 0)
      return { error: 'no existe el selector' };
    if (!(await element.isVisible()))
      return { error: 'el elemento está oculto' };
    await element.scrollIntoViewIfNeeded({ timeout: 5000 });
    const gtagLoaded = await waitForGtag(page);
    await sleep(2500);
    const box = await element.boundingBox();
    if (!box) return { error: 'el elemento no es visible' };

    const tapAt = await page.evaluate(() => performance.now());
    await tapCenter(page, box);
    await sleep(1500);

    const store = await readStore(page);
    const worst = worstInteraction(
      interactionsFrom(store).filter(i => i.startTime >= tapAt - 1)
    );
    if (!worst) return { error: 'sin entradas de Event Timing' };
    const end = worst.startTime + worst.inp;
    const loaf = store.loaf
      .filter(
        f =>
          f.duration >= 50 &&
          f.startTime < end &&
          f.startTime + f.duration > worst.startTime
      )
      .map(f => ({
        duration: Math.round(f.duration),
        styleDuration: f.styleDuration,
        layoutDuration: f.layoutDuration,
        scripts: f.scripts.map(s => scriptLabel(s, page.url()))
      }));
    return { ...worst, tapAt: Math.round(tapAt), gtagLoaded, loaf };
  } catch (error) {
    return { error: error.message };
  } finally {
    await context.close();
  }
}

async function main() {
  const runs = Number(args.runs);
  const pages = args.page ? PAGES.filter(p => p.path === args.page) : PAGES;
  if (pages.length === 0) throw new Error(`Página desconocida: ${args.page}`);

  const server = await startTarget({
    target: args.target,
    skipBuild: args['skip-build']
  });
  const browser = await launchBrowser();
  try {
    const jobs = pages.flatMap(page =>
      page.interactions.map(interaction => ({ page, interaction, runs: [] }))
    );
    // Intercaladas: el arranque en frío y la deriva del equipo se reparten entre interacciones.
    for (let run = 1; run <= runs; run++) {
      for (const job of jobs) {
        const result = await measureOnce(
          browser,
          server.origin + job.page.path,
          job.interaction
        );
        job.runs.push(result);
        const shown =
          result.error ?? `${result.inp} ms (ICP ${result.icp ?? '—'})`;
        console.log(
          `[${run}/${runs}] ${job.page.path} ${job.interaction.id}: ${shown}`
        );
      }
    }

    const measured = jobs.map(({ page, interaction, runs: results }) => ({
      page: page.path,
      id: interaction.id,
      label: interaction.label,
      selector: interaction.selector,
      runs: results
    }));
    const interactions = measured.map(m =>
      summarizeRuns(
        m.page,
        m.id,
        m.runs.map(result => (result.error ? null : result))
      )
    );

    writeResult(args.out ?? defaultOut('measure'), {
      meta: {
        ...runMeta({
          script: 'measure',
          target: args.target,
          origin: server.origin,
          browser
        }),
        runs
      },
      runs: measured,
      summary: { interactions }
    });
    console.table(
      interactions.map(i => ({
        página: i.page,
        interacción: i.id,
        INP: i.inp?.median ?? '—',
        'mín-máx': i.inp ? `${i.inp.min}-${i.inp.max}` : '—',
        fases: formatPhases(i.phases),
        ICP: i.icp ?? '—',
        medidas: `${i.measured}/${i.runs}`
      }))
    );
  } finally {
    await browser.close();
    await server.stop();
  }
}

await main();
