import { readJSON } from 'https://deno.land/x/flat@0.0.10/src/json.ts'
import { writeJSON } from 'https://deno.land/x/flat@0.0.10/src/txt.ts'

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

const newFilename = 'public/price-postprocessed.json';
await writeJSON(newFilename, filteredData)
