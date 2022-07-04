import { writeJSON } from 'https://deno.land/x/flat@0.0.10/src/json.ts'
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

const compensacion_csv_to_json = parseCsv(remove_lines_compensacion_gas_replace)
let omie_compensacion = compensacion_csv_to_json.map((element, index) => {
  return {
    price: element.compensacion,
    hour: index
  };
});
omie_compensacion = omie_compensacion.filter(({ price }) => price);

await writeJSON('public/data/omie_compensacion_data.json', omie_compensacion)
