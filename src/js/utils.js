import data from '../../public/price-postprocessed.json';

export function nextCheapHour() {
  const userHour = new Date().getHours();
  const userMinutes = new Date().getMinutes();

  const filteredData = data.filter(({ hour }) => +hour > userHour);
  const cheapHour = filteredData.reduce((p, c) => (p.price < c.price ? p : c));
  const { hour } = cheapHour;
  let timerHour = hour - (userHour + 1);
  const timerMinutes = Math.abs(60 - userMinutes);
  let textHour = timerHour > 1 ? 'horas y' : 'hora';
  textHour = textHour !== 0 ? textHour : '';
  timeHour = timeHour !== 0 ? textHour : '';
  const textMinutes = timerMinutes > 1 ? 'minutos' : 'minuto';
  const text = `La próxima hora más barata es dentro de ${timerHour} ${textHour} y ${timerMinutes} ${textMinutes}`;
  console.log('text', text);
}
