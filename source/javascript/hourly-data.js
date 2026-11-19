export const is_week_end = date =>
  date.getDay() === 0 || date.getDay() === 7 ? true : false;

export function processHourlyData(data, userHour, userDay) {
  // First, create a copy sorted by price to determine color assignment
  const sortedByPrice = [...data].sort((a, b) => a.price - b.price);

  // Create a map for price-based color assignment
  const priceColorMap = new Map();
  sortedByPrice.forEach((item, index) => {
    let priceColor;
    if (index < 8) {
      priceColor = 'price-green'; // 8 cheapest - green
    } else if (index < 16) {
      priceColor = 'price-yellow'; // 8 middle - yellow
    } else {
      priceColor = 'price-red'; // 8 most expensive - red
    }
    priceColorMap.set(Number(item.hour), priceColor);
  });

  // Process data with ranking info
  const processed = data.map(({ hour, price, ...rest }) => ({
    hourHasPassed: +hour < userHour,
    originalPrice: price,
    price: price.toFixed(3),
    hour,
    priceColor: priceColorMap.get(Number(hour)),
    ...rest
  }));

  // Tramo based on time slots (for labels when checkbox is activated)
  const isWeekend = is_week_end(userDay);
  processed.forEach(element => {
    if (isWeekend) {
      element.tramo = 'valle';
    } else if (element.hour >= 0 && element.hour < 8) {
      element.tramo = 'valle';
    } else if (
      (element.hour >= 8 && element.hour < 10) ||
      (element.hour >= 14 && element.hour < 18) ||
      (element.hour >= 22 && element.hour < 24)
    ) {
      element.tramo = 'llano';
    } else {
      element.tramo = 'punta';
    }
  });

  return processed;
}
