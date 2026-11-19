// Piezas compartidas por `measure.mjs` y `load.mjs`: build y servidor local, navegador
// emulado (Pixel 7 con la CPU a 4×) y escritura de resultados.

import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { chromium, devices } from 'playwright';

import { installObservers } from './observer.mjs';

export const DEVICE = 'Pixel 7';
export const CPU_RATE = 4;
export const RESULTS_DIR = 'docs/sprints/06/medicion';
const PORT = 4173;
const BUILD_DIR = join(tmpdir(), 'apaga-luz-inp-build');
const VITE = 'node_modules/.bin/vite';

// Slow 4G de DevTools: 150 ms de RTT y 1,6 Mbps de bajada.
export const SLOW_4G = {
  offline: false,
  latency: 150,
  downloadThroughput: (1.6 * 1024 * 1024) / 8,
  uploadThroughput: (750 * 1024) / 8
};

export const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit' });
    child.on('exit', code =>
      code === 0
        ? resolve()
        : reject(new Error(`${command} ${args.join(' ')} → ${code}`))
    );
  });
}

async function waitForServer(url, timeoutMs = 30000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      if ((await fetch(url)).ok) return;
    } catch {
      // Todavía no escucha.
    }
    await sleep(250);
  }
  throw new Error(`El servidor no responde en ${url}`);
}

// Sin `target`: build de producción en una carpeta temporal (no toca `build/`) servido con
// `vite preview`. Con `target`: se mide esa URL tal cual.
export async function startTarget({ target, skipBuild }) {
  if (target) return { origin: new URL(target).origin, stop: async () => {} };
  if (!skipBuild)
    await run(VITE, ['build', '--outDir', BUILD_DIR, '--emptyOutDir']);
  const preview = spawn(
    VITE,
    ['preview', '--outDir', BUILD_DIR, '--port', String(PORT), '--strictPort'],
    { stdio: 'ignore' }
  );
  const origin = `http://localhost:${PORT}`;
  await waitForServer(origin);
  return {
    origin,
    stop: async () => {
      preview.kill();
    }
  };
}

export function launchBrowser() {
  return chromium.launch();
}

// Contexto nuevo por pasada, con los observadores inyectados antes de cargar.
export async function openPage(browser, { network } = {}) {
  const context = await browser.newContext({ ...devices[DEVICE] });
  await context.addInitScript(installObservers);
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: CPU_RATE });
  if (network) {
    await cdp.send('Network.enable');
    await cdp.send('Network.emulateNetworkConditions', network);
  }
  return { context, page, cdp };
}

export async function tapCenter(page, box) {
  await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
}

export const readStore = page => page.evaluate(() => window.__inp);

// GA4 se carga con el primer gesto (también el `scroll` de llevar el elemento a la vista) o a
// los 5 s, y su ejecución ocupa un frame de unos 165 ms a 4×. Si coincide con el toque, la
// pasada mide a gtag y no a la interacción: se espera a que haya cargado. Devuelve si cargó.
export async function waitForGtag(page, timeout = 10000) {
  return page
    .waitForFunction(
      () =>
        performance
          .getEntriesByType('resource')
          .some(
            e =>
              e.name.includes('googletagmanager.com/gtag/js') &&
              e.responseEnd > 0
          ),
      null,
      { timeout, polling: 250 }
    )
    .then(() => true)
    .catch(() => false);
}

export function writeResult(out, result) {
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, `${JSON.stringify(result, null, 2)}\n`);
  console.log(`Resultado en ${out}`);
}

export const defaultOut = name =>
  join(
    RESULTS_DIR,
    `${name}-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
  );

// Cabecera común de los resultados.
export const runMeta = ({ script, target, origin, browser }) => ({
  script,
  target: target ?? 'local (vite build + vite preview)',
  origin,
  device: DEVICE,
  cpu: CPU_RATE,
  browser: browser.version(),
  date: new Date().toISOString()
});
