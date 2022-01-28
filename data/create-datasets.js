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

const reduced = filteredData.reduce((m, d) => {
  if (!m[d.dia]) {
    m[d.dia] = { ...d, count: 1 };
    return m;
  }
  m[d.dia].precio += d.precio;
  m[d.dia].count += 1;
  return m;
}, {});

const groupDataByDay = Object.keys(reduced).map((itemByDay) => {
  const item = reduced[itemByDay];
  return {
    price: +(item.precio / item.count).toFixed(2),
    day: item.dia.split('/')[0],
    month: item.dia.split('/')[1],
    year: item.dia.split('/')[2],
    date: `${item.dia.split('/')[1]}/${item.dia.split('/')[0]}/${item.dia.split('/')[2]}`,
    monthYear: `${item.dia.split('/')[1]}/${item.dia.split('/')[2]}`
  }
})

const reducedByMonth = groupDataByDay.reduce((m, d) => {
  if (!m[d.monthYear]) {
    m[d.monthYear] = { ...d, count: 1 };
    return m;
  }
  m[d.monthYear].price += d.price;
  m[d.monthYear].count += 1;
  return m;
}, {});

const groupDataByMonth = Object.keys(reducedByMonth).map((itemByMonth) => {
  const item = reducedByMonth[itemByMonth];
  return {
    averagePrice: +(item.price / item.count).toFixed(2),
    monthYear: item.monthYear,
    month: item.month,
    date: item.date,
    year: item.year
  }
})

const newFileByDay = 'group-by-day.json';
const newFileByMonth = 'group-by-month.json';
await writeJSON(newFileByDay, groupDataByDay)
await writeJSON(newFileByMonth, groupDataByMonth)
