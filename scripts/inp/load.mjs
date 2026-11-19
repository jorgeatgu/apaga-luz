// Medidor de la ventana de carga (Sprint 06, fase 0).
//
// Uso:
//   npm run inp:load -- [--out=<fichero.json>] [--runs=5] [--page=/] [--target=<URL>]
//                       [--skip-build]
//
// Sin `--target`, build de producción servido en local (como `inp:measure`). Con
// `--target=https://www.apaga-luz.com` mide producción, sin bloquear terceros.
// Chromium con `devices['Pixel 7']`, CPU a 4× y red Slow 4G (150 ms RTT, 1,6 Mbps). Cada pasada
// abre tres contextos nuevos:
//   - Toque único (`first-tap-menu`): un toque al botón del menú en `domcontentloaded`.
//   - Ráfaga (`burst-menu`): desde `domcontentloaded`, 24 toques al menú cada 300 ms (si un toque
//     se retrasa, el siguiente espera a su hueco: no se recuperan). Se queda el peor toque y los
//     LoAF de 50 ms o más hasta el final de la ráfaga, sumados por script (`gtag/js`,
//     `adsbygoogle.js`, `adsense/…/sh`, en línea y propios).
//   - Primer scroll: un gesto de scroll táctil 1 s después de `domcontentloaded` y el LoAF más
//     largo de los 3 s siguientes, con sus scripts. Si la página no se desplaza, no es medible.
// Mediana de las pasadas (5 por defecto). Por defecto escribe en docs/sprints/06/medicion/.

import { parseArgs } from 'node:util';

import {
  SLOW_4G,
  defaultOut,
  launchBrowser,
  openPage,
  readStore,
  runMeta,
  sleep,
  startTarget,
  tapCenter,
  writeResult
} from './harness.mjs';
import {
  formatPhases,
  interactionsFrom,
  loafByScript,
  median,
  summarizeLoaf,
  summarizeRuns,
  worstInteraction
} from './metrics.mjs';

const { values: args } = parseArgs({
  options: {
    out: { type: 'string' },
    runs: { type: 'string', default: '5' },
    page: { type: 'string', default: '/' },
    target: { type: 'string' },
    'skip-build': { type: 'boolean', default: false }
  }
});

const BURST_TAPS = 24;
const BURST_INTERVAL = 300;
const SCROLL_WINDOW = 3000;
const MENU = '.menu-toggle';
const GOTO = { waitUntil: 'domcontentloaded', timeout: 60000 };

async function settle(page) {
  await page.waitForLoadState('load', { timeout: 60000 }).catch(() => {});
  await sleep(3000);
}

// Abre un contexto con Slow 4G, ejecuta `measure` y lo cierra pase lo que pase.
async function withLoadingPage(browser, url, measure) {
  const { context, page, cdp } = await openPage(browser, { network: SLOW_4G });
  try {
    await page.goto(url, GOTO);
    return await measure(page, cdp);
  } catch (error) {
    return { error: error.message };
  } finally {
    await context.close();
  }
}

async function menuBox(page) {
  return page.locator(MENU).first().boundingBox();
}

const firstTapRun = (browser, url) =>
  withLoadingPage(browser, url, async page => {
    const box = await menuBox(page);
    if (!box) return { error: 'no hay botón de menú visible' };
    await tapCenter(page, box);
    await settle(page);
    return { worst: worstInteraction(interactionsFrom(await readStore(page))) };
  });

const burstRun = (browser, url) =>
  withLoadingPage(browser, url, async page => {
    // El menú va en la cabecera fija: su caja no cambia durante la carga.
    const box = await menuBox(page);
    if (!box) return { error: 'no hay botón de menú visible' };
    const startedAt = Date.now();
    const tapTimes = [];
    for (let slot = 0; slot < BURST_TAPS; ) {
      tapTimes.push(Date.now() - startedAt);
      await tapCenter(page, box);
      // Siguiente hueco libre de la cadencia: los que se han pasado se saltan.
      slot = Math.max(
        slot + 1,
        Math.ceil((Date.now() - startedAt) / BURST_INTERVAL)
      );
      if (slot < BURST_TAPS)
        await sleep(startedAt + slot * BURST_INTERVAL - Date.now());
    }
    const burstEnd = await page.evaluate(() => performance.now());
    await settle(page);
    const store = await readStore(page);
    const timing = await page.evaluate(() => {
      const [nav] = performance.getEntriesByType('navigation');
      return {
        domContentLoaded: nav.domContentLoadedEventEnd,
        load: nav.loadEventEnd
      };
    });
    return {
      worst: worstInteraction(interactionsFrom(store)),
      taps: tapTimes.length,
      tapTimes,
      loafByScript: loafByScript(
        store.loaf.filter(frame => frame.startTime < burstEnd),
        page.url()
      ),
      timing: {
        domContentLoaded: Math.round(timing.domContentLoaded),
        load: Math.round(timing.load),
        burstEnd: Math.round(burstEnd)
      }
    };
  });

const scrollRun = (browser, url) =>
  withLoadingPage(browser, url, async (page, cdp) => {
    await sleep(1000);
    const scrollAt = await page.evaluate(() => performance.now());
    await cdp.send('Input.synthesizeScrollGesture', {
      x: 200,
      y: 600,
      yDistance: -600,
      gestureSourceType: 'touch'
    });
    await settle(page);
    const store = await readStore(page);
    const scrolled = await page.evaluate(() => window.scrollY);
    if (scrolled === 0)
      return { scrolled, frame: null, error: 'la página no se desplazó' };
    const frames = store.loaf.filter(
      frame =>
        frame.startTime >= scrollAt &&
        frame.startTime < scrollAt + SCROLL_WINDOW
    );
    if (frames.length === 0) return { scrolled, frame: null };
    const longest = frames.reduce((a, b) => (b.duration > a.duration ? b : a));
    return {
      scrolled,
      frame: {
        duration: Math.round(longest.duration),
        startAfterScroll: Math.round(longest.startTime - scrollAt),
        loafByScript: loafByScript([longest], page.url(), { minDuration: 0 })
      }
    };
  });

function summarizeScroll(scrollRuns) {
  const frames = scrollRuns.map(run => run.frame).filter(Boolean);
  const durations = frames.map(frame => frame.duration);
  return {
    measured: frames.length,
    notScrolled: scrollRuns.filter(run => run.scrolled === 0).length,
    median: median(durations),
    min: frames.length ? Math.min(...durations) : null,
    max: frames.length ? Math.max(...durations) : null,
    scripts: summarizeLoaf(frames.map(frame => frame.loafByScript))
  };
}

async function main() {
  const runs = Number(args.runs);
  const server = await startTarget({
    target: args.target,
    skipBuild: args['skip-build']
  });
  const browser = await launchBrowser();
  const url = server.origin + args.page;
  try {
    const firstTap = [];
    const burst = [];
    const scroll = [];
    for (let run = 1; run <= runs; run++) {
      const tapResult = await firstTapRun(browser, url);
      const burstResult = await burstRun(browser, url);
      const scrollResult = await scrollRun(browser, url);
      firstTap.push(tapResult);
      burst.push(burstResult);
      scroll.push(scrollResult);
      const inpOf = result => result.error ?? `${result.worst?.inp ?? '—'} ms`;
      console.log(
        `[${run}/${runs}] toque: ${inpOf(tapResult)} · ráfaga: ${inpOf(
          burstResult
        )} ` +
          `(${burstResult.taps ?? 0} toques) · scroll: ` +
          `${scrollResult.error ?? `${scrollResult.frame?.duration ?? '—'} ms`}`
      );
    }

    const worstOf = results => results.map(result => result.worst ?? null);
    const interactions = [
      summarizeRuns(args.page, 'first-tap-menu', worstOf(firstTap)),
      summarizeRuns(args.page, 'burst-menu', worstOf(burst))
    ];
    const loaf = summarizeLoaf(
      burst.filter(result => !result.error).map(result => result.loafByScript)
    );
    const scrollFrame = summarizeScroll(scroll);

    writeResult(args.out ?? defaultOut('load'), {
      meta: {
        ...runMeta({
          script: 'load',
          target: args.target,
          origin: server.origin,
          browser
        }),
        page: args.page,
        network: 'Slow 4G (150 ms RTT, 1,6 Mbps)',
        runs,
        burst: { taps: BURST_TAPS, intervalMs: BURST_INTERVAL, selector: MENU }
      },
      runs: { firstTap, burst, scroll },
      summary: { interactions, loafByScript: loaf, scrollFrame }
    });

    for (const i of interactions) {
      console.log(
        `${i.id}: ${i.inp?.median ?? '—'} ms [${i.inp?.min ?? '—'}-${
          i.inp?.max ?? '—'
        }], ` + `fases ${formatPhases(i.phases)}`
      );
    }
    console.log(
      `Frame del primer scroll: ${scrollFrame.median ?? '—'} ms ` +
        `[${scrollFrame.min ?? '—'}-${scrollFrame.max ?? '—'}] en ${
          scrollFrame.measured
        }/${runs}` +
        (scrollFrame.notScrolled
          ? ` (sin desplazar en ${scrollFrame.notScrolled})`
          : '')
    );
    console.table(
      loaf.map(l => ({
        script: l.script,
        mediana: l.median,
        máx: l.max,
        pasadas: l.runsSeen
      }))
    );
  } finally {
    await browser.close();
    await server.stop();
  }
}

await main();
