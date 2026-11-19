// Medidor de la ventana de carga (Sprint 06, fase 0).
//
// Uso:
//   npm run inp:load -- [--out=<fichero.json>] [--runs=5] [--page=/] [--target=<URL>]
//                       [--skip-build]
//
// Sin `--target`, build de producción servido en local (como `inp:measure`). Con
// `--target=https://www.apaga-luz.com` mide producción, sin bloquear terceros.
// Chromium con `devices['Pixel 7']`, CPU a 4× y red Slow 4G (150 ms RTT, 1,6 Mbps). Por pasada:
//   - Ráfaga: desde `domcontentloaded`, 24 toques al botón del menú cada 300 ms. Se queda el peor
//     toque (`burst-menu`) y los LoAF de 50 ms o más agregados por script (`gtag/js`,
//     `adsbygoogle.js`, `adsense/…/sh`, en línea y propios).
//   - Primer scroll: contexto nuevo, un gesto de scroll táctil 1 s después de `domcontentloaded`,
//     y el LoAF más largo de los 3 s siguientes con sus scripts.
// Mediana de las pasadas (5 por defecto). Por defecto escribe en docs/sprints/06/medicion/.

import { parseArgs } from 'node:util';

import {
  CPU_RATE,
  SLOW_4G,
  defaultOut,
  launchBrowser,
  openPage,
  readStore,
  sleep,
  startTarget,
  tapCenter,
  writeResult
} from './harness.mjs';
import {
  loafByScript,
  median,
  scriptLabel,
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
const MENU = '.menu-toggle';

async function settle(page) {
  await page.waitForLoadState('load', { timeout: 60000 }).catch(() => {});
  await sleep(3000);
}

async function burstRun(browser, url) {
  const { context, page } = await openPage(browser, { network: SLOW_4G });
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    const box = await page.locator(MENU).first().boundingBox();
    if (!box) return { error: 'no hay botón de menú visible' };
    const startedAt = Date.now();
    for (let tap = 0; tap < BURST_TAPS; tap++) {
      await tapCenter(page, box);
      await sleep(
        Math.max(0, startedAt + (tap + 1) * BURST_INTERVAL - Date.now())
      );
    }
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
      worst: worstInteraction(store),
      loafByScript: loafByScript(store, page.url()),
      timing: {
        domContentLoaded: Math.round(timing.domContentLoaded),
        load: Math.round(timing.load)
      }
    };
  } catch (error) {
    return { error: error.message };
  } finally {
    await context.close();
  }
}

async function scrollRun(browser, url) {
  const { context, page, cdp } = await openPage(browser, { network: SLOW_4G });
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
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
    const frames = store.loaf.filter(
      f => f.startTime >= scrollAt && f.startTime < scrollAt + 3000
    );
    if (frames.length === 0) return { scrolled, frame: null };
    const longest = frames.reduce((a, b) => (b.duration > a.duration ? b : a));
    return {
      scrolled,
      frame: {
        duration: Math.round(longest.duration),
        startAfterScroll: Math.round(longest.startTime - scrollAt),
        scripts: longest.scripts.map(s => ({
          script: scriptLabel(s, page.url()),
          invoker: s.invoker,
          duration: Math.round(s.duration)
        }))
      }
    };
  } catch (error) {
    return { error: error.message };
  } finally {
    await context.close();
  }
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
    const burst = [];
    const scroll = [];
    for (let run = 0; run < runs; run++) {
      burst.push(await burstRun(browser, url));
      scroll.push(await scrollRun(browser, url));
      const b = burst.at(-1);
      const s = scroll.at(-1);
      console.log(
        `[${run + 1}/${runs}] ráfaga: ${
          b.error ?? `${b.worst?.inp ?? '—'} ms`
        } · ` +
          `scroll: ${
            s.error ??
            `${s.frame?.duration ?? '—'} ms (desplazado ${s.scrolled}px)`
          }`
      );
    }

    const okBurst = burst.filter(b => !b.error);
    const interactions = [
      summarizeRuns(
        args.page,
        'burst-menu',
        burst.map(b => b.worst ?? null)
      )
    ];
    const loaf = summarizeLoaf(okBurst.map(b => b.loafByScript));
    const frames = scroll.map(s => s.frame).filter(Boolean);
    const scrollFrame = {
      measured: frames.length,
      median: median(frames.map(f => f.duration)),
      min: frames.length ? Math.min(...frames.map(f => f.duration)) : null,
      max: frames.length ? Math.max(...frames.map(f => f.duration)) : null,
      scripts: summarizeLoaf(
        frames.map(f =>
          f.scripts.reduce((totals, s) => {
            totals[s.script] = (totals[s.script] ?? 0) + s.duration;
            return totals;
          }, {})
        )
      )
    };

    writeResult(args.out ?? defaultOut('load'), {
      meta: {
        script: 'load',
        target: args.target ?? 'local (vite build + vite preview)',
        origin: server.origin,
        page: args.page,
        device: 'Pixel 7',
        cpu: CPU_RATE,
        network: 'Slow 4G (150 ms RTT, 1,6 Mbps)',
        runs,
        burst: { taps: BURST_TAPS, intervalMs: BURST_INTERVAL, selector: MENU },
        browser: browser.version(),
        date: new Date().toISOString()
      },
      runs: { burst, scroll },
      summary: { interactions, loafByScript: loaf, scrollFrame }
    });

    const [b] = interactions;
    console.log(
      `Peor toque de la ráfaga: ${b.inp?.median ?? '—'} ms ` +
        `[${b.inp?.min ?? '—'}-${b.inp?.max ?? '—'}], fases ` +
        `${
          b.phases
            ? `${b.phases.inputDelay} / ${b.phases.processing} / ${b.phases.presentation}`
            : '—'
        }`
    );
    console.log(
      `Frame del primer scroll: ${scrollFrame.median ?? '—'} ms ` +
        `[${scrollFrame.min ?? '—'}-${scrollFrame.max ?? '—'}] en ${
          scrollFrame.measured
        }/${runs}`
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
