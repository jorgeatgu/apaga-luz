import { readJSON, writeJSON } from 'https://deno.land/x/flat@0.0.9/mod.ts' 

const filename = 'price.json';
const json = await readJSON(filename)

const filteredData = json.PVPC.map(({ Dia, Hora, PCB }) => {
  return {
    day: Dia,
    hour: Hora.split('-')[0],
    price: +(PCB.split(',')[0]) / 1000
  }
})

const newFilename = `price-postprocessed.json`;
await writeJSON(newFilename, filteredData)
