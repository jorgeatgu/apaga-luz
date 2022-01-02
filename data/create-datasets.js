import { readJSON, writeJSON } from 'https://deno.land/x/flat@0.0.10/src/json.ts'

const filename = 'precios.json';
const json = await readJSON(filename);

const filteredData = json.map(({ dia, hora, precio }) => {
  return {
    dia: dia,
    hour: hora,
    precio: +precio
  };
});

const reduced = filteredData.reduce(function(m, d) {
  if (!m[d.dia]) {
    m[d.dia] = { ...d, count: 1 };
    return m;
  }
  m[d.dia].precio += d.precio;
  m[d.dia].count += 1;
  return m;
}, {});

const result = Object.keys(reduced).map(function(k) {
  const item = reduced[k];
  return {
    dia: item.dia,
    precio: (item.precio / item.count).toFixed(2),
  }
})

const resultJSON = result

const newFilename = 'group-by-day.json';
await writeJSON(newFilename, resultJSON)
