import { readJSON, writeJSON } from 'https://deno.land/x/flat@0.0.9/mod.ts' 

const filename = 'price.json';
const json = await readJSON(filename)

const filteredData = json.PVPC.map(({ Dia, Hora, PCB }) => {
  return {
    dia: Dia,
    hora: parseDate(Hora),
    precio: +(PCB.split(',')[0]) / 1000
  }
})

function parseDate(hora) {
  const hour = hora.split('-')[0]
  const todayIs = new Date()
  const year = todayIs.getFullYear()
  const month = todayIs.getMonth()
  const day = todayIs.getDay()

  return new Date(year, month, day, hour, "00")
}

const newFilename = `price-postprocessed.json`;
await writeJSON(newFilename, filteredData)
