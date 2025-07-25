import { readJSON, writeJSON } from 'https://deno.land/x/flat@0.0.10/src/json.ts'

const filename = 'public/data/price.json';
const json = await readJSON(filename)
let transformedData

transformPriceData()

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

function transformPriceData() {
  const values = json.indicator.values;

  // Transformar cada valor al formato deseado
  transformedData = values.map(item => {
    // Extraer fecha y hora del datetime usando regex para evitar problemas de zona horaria
    const datetimeStr = item.datetime;
    const dateMatch = datetimeStr.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):/);

    if (!dateMatch) {
      throw new Error(`Formato de fecha inválido: ${datetimeStr}`);
    }

    const [, year, month, dayOfMonth, hourStr] = dateMatch;
    const day = `${dayOfMonth}/${month}/${year}`;
    const hour = parseInt(hourStr, 10);

    // Convertir precio de €/MWh a €/kWh (dividir entre 1000)
    const price = Math.round((item.value / 1000) * 1000) / 1000; // Redondear a 3 decimales

    // Determinar la zona horaria
    const zone = createZone(hour);

    return {
      day: day,
      hour: hour,
      price: price,
      zone: zone
    };
  });

}

const newFilename = 'public/data/canary_price.json';
await writeJSON(newFilename, transformedData)
