import { readJSON, writeJSON } from 'https://deno.land/x/flat@0.0.9/mod.ts'
import { createZone } from './src/js/utils.js';

const filename = 'price.json';
const json = await readJSON(filename)

const filteredData = json.PVPC.map(({ Dia, Hora, PCB }) => {
  const getFirstHour = Hora.split('-')[0];
  return {
    day: Dia,
    hour: +getFirstHour,
    price: +PCB.split(',')[0] / 1000,
    zone: createZone(+getFirstHour)
  };
});

let gitHubHour = new Date().getHours();
let newFilename
if (gitHubHour < 23) {
  newFilename = `public/price-next-day.json`
} else {
  newFilename = `public/price-postprocessed.json`
}

await writeJSON(newFilename, filteredData)
