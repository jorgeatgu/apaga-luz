//Este es el archivo que usamos con flat
//para generar diferentes datasets que abastecen
//de datos a las gráficas del comparador
//también a las tablas de precios del index
import { readJSON, writeJSON } from 'https://deno.land/x/flat@0.0.10/src/json.ts'

const json_today_prices = await readJSON('data/price.json');
const json_all_prices_yesterday = await readJSON('data/all_prices.json');

//Primero transformamos los datos que viene de la API
//son los datos del día en el que vivimos
const transform_today_data = json_today_prices.PVPC.map(({ Dia, Hora, PCB }) => {
  return {
    dia: Dia,
    hora: Hora,
    precio: +(PCB.replace(',', '.'))
  };
});

//Concatenamos los datos de hoy con el histórico
//y los guardamos en el archivo del histórico
let json_all_prices = [...json_all_prices_yesterday, ...transform_today_data]
json_all_prices.forEach(d => {
  d.precio = parseFloat(d.precio)
})
await writeJSON('data/all_prices.json', json_all_prices)

//Primer reduce para que sume el precio
//de todas las horas del día
const reduced = json_all_prices.reduce((m, d) => {
  if (!m[d.dia]) {
    m[d.dia] = { ...d, count: 1 };
    return m;
  }
  m[d.dia].precio += d.precio;
  m[d.dia].count += 1;
  return m;
}, {});

//Ahora vamos a usar el reduce para crear
//un array con el precio medio por día
//agregamos unas cuantas keys más para
//las gráficas, y preparamos las fechas
const group_data_by_day = Object.keys(reduced).map((item_by_day) => {
  const item = reduced[item_by_day];
  return {
    price: +(item.precio / item.count).toFixed(2),
    day: item.dia.split('/')[0],
    month: item.dia.split('/')[1],
    year: item.dia.split('/')[2],
    date: `${item.dia.split('/')[1]}/${item.dia.split('/')[0]}/${item.dia.split('/')[2]}`,
    monthYear: `${item.dia.split('/')[1]}/${item.dia.split('/')[2]}`
  }
})

//Similar al primer reduce, pero ahora
//vamos a sumar los precios agrupando por mes
const reduced_by_month = group_data_by_day.reduce((m, d) => {
  if (!m[d.monthYear]) {
    m[d.monthYear] = { ...d, count: 1 };
    return m;
  }
  m[d.monthYear].price += d.price;
  m[d.monthYear].count += 1;
  return m;
}, {});

//Lo mismo, usamos el reduce para
//sacar el precio medio por mes, y
//aprovechamos las transformaciones anteriores
const group_prices_by_month = Object.keys(reduced_by_month).map((item_by_month) => {
  const item = reduced_by_month[item_by_month];
  return {
    averagePrice: +(item.price / item.count).toFixed(2),
    monthYear: item.monthYear,
    month: item.month,
    date: item.date,
    year: item.year
  }
})

//Generamos de nuevo los JSON con las
//diferentes agrupaciones.
const new_file_by_day = 'data/group_prices_by_day.json';
const new_file_by_month = 'data/group_prices_by_month.json';
await writeJSON(new_file_by_day, group_data_by_day)
await writeJSON(new_file_by_month, group_prices_by_month)
