// OMIE publica el mercado diario en periodos cuartohorarios (96 por día) y la
// tabla de mañana trabaja por horas: se promedian los cuatro cuartos de cada
// hora. Con datos horarios (24 periodos) se devuelven tal cual.
export function omie_hourly_prices(data) {
  const rows = data.filter(
    ({ hour, price }) => Number.isFinite(hour) && Number.isFinite(price)
  );
  const periods_per_hour = rows.length > 25 ? 4 : 1;
  const by_hour = new Map();
  for (const { hour: period, price, ...rest } of rows) {
    const hour = Math.floor(period / periods_per_hour);
    const bucket = by_hour.get(hour) || { ...rest, hour, prices: [] };
    bucket.prices.push(price);
    by_hour.set(hour, bucket);
  }
  return [...by_hour.values()].map(({ prices, ...row }) => ({
    ...row,
    price: prices.reduce((sum, price) => sum + price, 0) / prices.length
  }));
}
