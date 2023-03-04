import { writeJSON, readJSON } from 'https://deno.land/x/flat@0.0.10/src/json.ts'
import { readTXT } from 'https://deno.land/x/flat@0.0.10/src/txt.ts'

//Vamos a creer que los del OMIE respetan la estructura, a ñapear
const removeLines = (data, lines = []) => {
  return data
    .split('\n')
    .filter((val, idx) => lines.indexOf(idx) === -1)
    .join('\n');
}

/*https://stackoverflow.com/a/61474145*/
const parseCsv = csv => {
  let lines = csv.split("\n");
  const header = lines.shift().split(";")
  return lines.map(line => {
    const bits = line.split(",")
    let obj = {};
    header.forEach((h, i) => {
      if(h) {
        obj[h] = bits[i]
      }
    });
    return obj;
  })
};

const compensacion_gas = await readTXT('public/data/omie_prices_gas.json');
const remove_lines_compensacion_gas = removeLines(compensacion_gas, [0,1,2,4,5,6,7,8,9,10,11,12,13])
let remove_lines_compensacion_gas_replace = remove_lines_compensacion_gas.replaceAll(',', '.').replaceAll(';',',')
remove_lines_compensacion_gas_replace = remove_lines_compensacion_gas_replace.replace('Precio de ajuste en el sistema espa�ol (EUR/MWh),   ', 'compensacion;\n').replaceAll(',   ',',\n')

const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
let get_date = tomorrow.getDate();
let get_month = tomorrow.getMonth() + 1;
const get_year = tomorrow.getFullYear();

get_month = get_month < 10 ? `0${get_month}` : get_month;
get_date = get_date < 10 ? `0${get_date}` : get_date;

const compensacion_csv_to_json = parseCsv(remove_lines_compensacion_gas_replace)
let omie_compensacion = compensacion_csv_to_json.map((element, index) => {
  return {
    precio: element.compensacion === "0" ? 0 : +((element.compensacion / 1000).toFixed(3)),
    hora: index,
    dia: `${get_date}/${get_month}/${get_year}`
  };
});

omie_compensacion = omie_compensacion.filter(({ precio }) => precio);

const omie_compensacion_historic = await readJSON('public/data/historic_compensacion_gas.json');
const omie_compensacion_historic_update = [...omie_compensacion, ...omie_compensacion_historic]

const reduced = omie_compensacion_historic_update.reduce((m, d) => {
  if (!m[d.dia]) {
    m[d.dia] = { ...d, count: 1 };
    return m;
  }
  m[d.dia].precio += d.precio;
  m[d.dia].count += 1;
  return m;
}, {});

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

await writeJSON('public/data/omie_compensacion_data_by_month.json', group_prices_by_month)
await writeJSON('public/data/omie_compensacion_data_by_day.json', group_data_by_day)
await writeJSON('public/data/omie_compensacion_data.json', omie_compensacion)
await writeJSON('public/data/historic_compensacion_gas.json', omie_compensacion_historic_update)
