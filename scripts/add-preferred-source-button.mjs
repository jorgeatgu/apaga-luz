import { readFile, writeFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const NOTICIAS_DIR = join(ROOT, 'noticias');

const BUTTON_HTML = `<a href="https://www.google.com/preferences/source?q=apaga-luz.com" class="social-share-button preferred-source" target="_blank" rel="noopener noreferrer" aria-label="Marcar Apaga-luz como fuente preferida en Google">
            <img src="/images/google-preferred-source-badge-light-es.png" srcset="/images/google-preferred-source-badge-light-es.png 1x, /images/google-preferred-source-badge-light-es@2x.png 2x" alt="Añadir Apaga-luz a tu Búsqueda de Google" loading="lazy" width="128" height="40">
          </a>`;

const WHATSAPP_BLOCK_REGEX = /(<a href="#" class="social-share-button share-whatsapp"[\s\S]*?<\/a>)(\s*<\/div>)/;

const slugs = (await readdir(NOTICIAS_DIR, { withFileTypes: true }))
  .filter((d) => d.isDirectory())
  .map((d) => d.name);

let okCount = 0;
let skipCount = 0;
let missCount = 0;

for (const slug of slugs) {
  const filePath = join(NOTICIAS_DIR, slug, 'index.html');
  let html;
  try {
    html = await readFile(filePath, 'utf8');
  } catch {
    continue;
  }

  if (html.includes('preferred-source')) {
    console.log(`[SKIP] ${slug} (already has button)`);
    skipCount++;
    continue;
  }

  if (!WHATSAPP_BLOCK_REGEX.test(html)) {
    console.log(`[MISS] ${slug} (no social-share/whatsapp block found)`);
    missCount++;
    continue;
  }

  const updated = html.replace(
    WHATSAPP_BLOCK_REGEX,
    (_, whatsappAnchor, closing) =>
      `${whatsappAnchor}\n          ${BUTTON_HTML}${closing}`
  );

  await writeFile(filePath, updated, 'utf8');
  console.log(`[OK]   ${slug}`);
  okCount++;
}

console.log(`\nDone. ok=${okCount} skip=${skipCount} miss=${missCount} total=${slugs.length}`);
