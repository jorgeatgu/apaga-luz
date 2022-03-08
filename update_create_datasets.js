//Este es el archivo que usamos con flat
//para generar diferentes datasets que abastecen
//de datos a las gráficas del comparador
//también a las tablas de precios del index
import { readJSON, writeJSON } from 'https://deno.land/x/flat@0.0.10/src/json.ts'

const json_today_prices = await readJSON('public/data/price.json');
const json_all_prices_yesterday = await readJSON('public/data/all_prices.json');

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
await writeJSON('public/data/all_prices.json', json_all_prices)

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

const transform_today_prices = json_today_prices.PVPC.map(({ Dia, Hora, PCB }) => {
  const get_first_hour = Hora.split('-')[0];
  return {
    day: Dia,
    hour: +get_first_hour,
    price: +PCB.split(',')[0] / 1000,
    zone: createZone(+get_first_hour)
  };
});

function createZone(hour) {
  if (hour >= 0 && hour < 8) {
    return 'valle';
  } else if (
    (hour >= 8 && hour < 10) ||
    (hour >= 14 && hour < 18) ||
    (hour >= 22 && hour < 24)
  ) {
    return 'llano';
  } else {
    return 'punta';
  }
}

let user_day = new Date();
user_day.setDate(user_day.getDate() + 1);

const get_string_day =
  user_day.getDate() < 10 ? `0${user_day.getDate()}` : user_day.getDate();
const get_string_month =
  user_day.getMonth() < 10
    ? `0${user_day.getMonth() + 1}`
    : user_day.getMonth() + 1;

const filtered_data_table_by_day = json_all_prices.filter(({ dia }) =>
  dia.includes(`${get_string_day}/${get_string_month}`)
);

const last_n_days = n_days =>
  [...Array(n_days)].map((_, index) => {
    const dates = new Date();
    dates.setDate(dates.getDate() - index);
    return dates;
  }).map(d => {
  const get_string_day = d.getDate() < 10 ? `0${d.getDate()}` : d.getDate();
  const get_string_month =
    d.getMonth() < 9 ? `0${d.getMonth() + 1}` : d.getMonth() + 1;
  return `${get_string_day}/${get_string_month}/${d.getFullYear()}`;
});

let last_week_strings = last_n_days(7);
let last_month_strings = last_n_days(30);
let last_year_strings = last_n_days(365);

const filtered_data_table_by_last_week = json_all_prices.filter(day =>
  last_week_strings.includes(day.dia)
);

const filtered_data_table_by_last_month = json_all_prices.filter(day =>
  last_month_strings.includes(day.dia)
);

last_year_strings = last_year_strings.map(element => `${element.split('/')[1]}/${element.split('/')[0]}/${element.split('/')[2]}`)

const group_prices_by_last_year = group_data_by_day.filter(day =>
  last_year_strings.includes(day.date)
);

//Generamos de nuevo los JSON con las
//diferentes agrupaciones.
const new_file_today = 'public/data/today_price.json';
const new_file_historic_today = 'public/data/historic_today_price.json';
const new_file_last_week = 'public/data/last_week_price.json';
const new_file_last_month = 'public/data/last_month_price.json';
const new_file_by_day = 'public/data/group_prices_by_day.json';
const new_file_by_month = 'public/data/group_prices_by_month.json';
const new_file_last_year_group = 'public/data/last_year_group_price.json';

await writeJSON(new_file_by_day, group_data_by_day)
await writeJSON(new_file_historic_today, filtered_data_table_by_day)
await writeJSON(new_file_last_week, filtered_data_table_by_last_week)
await writeJSON(new_file_last_month, filtered_data_table_by_last_month)
await writeJSON(new_file_by_month, group_prices_by_month)
await writeJSON(new_file_today, transform_today_prices)
await writeJSON(new_file_last_year_group, group_prices_by_last_year)
