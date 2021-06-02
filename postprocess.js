import { readJSON, writeJSON } from 'https://deno.land/x/flat@0.0.9/mod.ts' 

const filename = 'price.json';
const json = await readJSON(filename)

const filteredData = json.PVPC.map(({ Dia, Hora, PCB }) => {
  return {
    day: Dia,
    hour: Hora.split('-')[0],
    price: +(PCB.split(',')[0]) / 1000,
    zone: getZone(hour)
  }
})

function getZone(hour) {
  if(hour >= "0" && hour < "8") {
    return 'valle'
  } else if(hour >= "8" && hour < "10" || hour >= "14" && hour < "18" || hour >= "22" && hour < "24") {
    return 'llano'
  } else {
    return 'punta'
  }
}

const newFilename = `price-postprocessed.json`;
await writeJSON(newFilename, filteredData)
