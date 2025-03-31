import './../styles/styles.css';
import data_today from '/public/data/today_price.json';

document.addEventListener('DOMContentLoaded', function() {
  // Obtener las horas más baratas del día (ordenadas por precio)
  const cheapestHours = [...data_today]
    .sort((a, b) => a.price - b.price)
    .slice(0, 6); // Mostrar las 6 horas más baratas

  const cheapestHoursContainer = document.getElementById('cheapest-hours-list');

  if (cheapestHoursContainer) {
    // Crear elementos HTML para cada hora
    const hoursHTML = cheapestHours.map(hourData => {
      const formattedHour = hourData.hour < 10 ? `0${hourData.hour}:00` : `${hourData.hour}:00`;
      return `
        <div class="cheapest-hour-item">
          <span class="cheapest-hour-time valle">${formattedHour}</span>
          <span class="cheapest-hour-price">${hourData.price.toFixed(3)} €/kWh</span>
        </div>
      `;
    }).join('');

    // Insertar en el contenedor
    cheapestHoursContainer.innerHTML = `
      <div class="cheapest-hours-grid">
        ${hoursHTML}
      </div>
      <p class="cheapest-hours-note">Estas son las <strong>horas más baratas</strong> para hoy. La hora más económica es a las ${cheapestHours[0].hour < 10 ? `0${cheapestHours[0].hour}:00` : `${cheapestHours[0].hour}:00`} con un precio de ${cheapestHours[0].price.toFixed(3)} €/kWh.</p>
    `;
  }
});
