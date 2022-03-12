import { writeJSON } from 'https://deno.land/x/flat@0.0.10/src/json.ts'
import { readTXT } from 'https://deno.land/x/flat@0.0.10/src/txt.ts'

const json_all_prices_yesterday = await readTXT('omie_prices.json');

let json_all_prices_replace = json_all_prices_yesterday.replaceAll(';', ',')
json_all_prices_replace = json_all_prices_replace.replace('MARGINALPDBC,', 'year;month;day;hour;pricemax;pricemin;')

/*https://stackoverflow.com/a/61474145*/
const parseCsv = csv => {
  let lines = csv.split("\n");
  const header = lines.shift().split(";")
  return lines.map(line => {
    const bits = line.split(",")
    let obj = {};
    header.forEach((h, i) => obj[h] = bits[i]);
    return obj;
  })
};

const prices_csv_to_json = parseCsv(json_all_prices_replace)

let omie_data = prices_csv_to_json.map(({ year, month, day, hour, pricemax, pricemin }) => {
  return {
    year: year,
    month: month,
    day: day,
    hour: (+(hour) - 1),
    price: (pricemax / 1000),
    pricemin: (pricemin / 1000)
  };
});

omie_data = omie_data.filter(({ year }) => year);

await writeJSON('omie_data.json', omie_data)
