import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveTomorrowSource } from '../../source/javascript/tomorrow-notice.js';

const tomorrow = { year: 2026, month: 9, day: 20, weekday: 0 };

function loader(files) {
  return async url => files[url] ?? null;
}

test('ESIOS gana cuando tomorrow_price.json ya trae el día de mañana', async () => {
  const source = await resolveTomorrowSource(
    tomorrow,
    loader({
      '/data/tomorrow_price.json': [{ day: '20/09/2026', hour: '00-01' }],
      '/data/omie_data.json': [{ year: '2026', month: '09', day: '20' }]
    })
  );
  assert.equal(source, 'ESIOS');
});

test('OMIE cuando ESIOS aún tiene el día de hoy', async () => {
  const source = await resolveTomorrowSource(
    tomorrow,
    loader({
      '/data/tomorrow_price.json': [{ day: '19/09/2026', hour: '00-01' }],
      '/data/omie_data.json': [{ year: '2026', month: '09', day: '20' }]
    })
  );
  assert.equal(source, 'OMIE');
});

test('nada cuando ningún fichero contiene mañana', async () => {
  const source = await resolveTomorrowSource(
    tomorrow,
    loader({
      '/data/tomorrow_price.json': [{ day: '19/09/2026' }],
      '/data/omie_data.json': [{ year: '2026', month: '09', day: '19' }]
    })
  );
  assert.equal(source, null);
});

test('nada con ficheros ausentes, vacíos o mal formados', async () => {
  assert.equal(await resolveTomorrowSource(tomorrow, loader({})), null);
  assert.equal(
    await resolveTomorrowSource(
      tomorrow,
      loader({ '/data/tomorrow_price.json': [], '/data/omie_data.json': {} })
    ),
    null
  );
  assert.equal(
    await resolveTomorrowSource(
      tomorrow,
      loader({ '/data/tomorrow_price.json': [{ day: 20 }] })
    ),
    null
  );
});
