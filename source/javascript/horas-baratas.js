import './../styles/styles.css';
import data_today from '/public/data/today_price.json';

document.addEventListener('DOMContentLoaded', function () {
  // Inicializar componentes principales
  initCheapestHoursList();
  initSavingsCalculator();
  initTariffComparison();

  // Añadir efectos visuales y animaciones
  addVisualEffects();
});

// ======================================================
// FUNCIÓN PARA LAS HORAS MÁS BARATAS DEL DÍA
// ======================================================
function initCheapestHoursList() {
  // Obtener las horas más baratas del día (ordenadas por precio)
  const cheapestHours = [...data_today]
    .sort((a, b) => a.price - b.price)
    .slice(0, 6); // Mostrar las 6 horas más baratas

  const cheapestHoursContainer = document.getElementById('cheapest-hours-list');

  if (cheapestHoursContainer) {
    // Crear elementos HTML para cada hora
    const hoursHTML = cheapestHours
      .map((hourData, index) => {
        const formattedHour =
          hourData.hour < 10 ? `0${hourData.hour}:00` : `${hourData.hour}:00`;
        return `
        <div class="cheapest-hour-item" style="animation-delay: ${
          index * 100
        }ms">
          <span class="cheapest-hour-time valle">${formattedHour}</span>
          <span class="cheapest-hour-price">${hourData.price.toFixed(
            3
          )} €/kWh</span>
          ${
            index === 0
              ? '<div class="best-price-badge">Mejor precio</div>'
              : ''
          }
        </div>
      `;
      })
      .join('');

    // Insertar en el contenedor
    cheapestHoursContainer.innerHTML = `
      <div class="cheapest-hours-grid">
        ${hoursHTML}
      </div>
      <p class="cheapest-hours-note">Estas son las <strong>horas más baratas</strong> para hoy. La hora más económica es a las ${
        cheapestHours[0].hour < 10
          ? `0${cheapestHours[0].hour}:00`
          : `${cheapestHours[0].hour}:00`
      } con un precio de ${cheapestHours[0].price.toFixed(3)} €/kWh.</p>
    `;

    // Animar la aparición de las tarjetas
    setTimeout(() => {
      const hourItems = document.querySelectorAll('.cheapest-hour-item');
      hourItems.forEach(item => {
        item.classList.add('visible');
      });
    }, 300);
  }
}

// ======================================================
// CALCULADORA DE AHORRO PERSONALIZADA
// ======================================================
function initSavingsCalculator() {
  // Referencias a elementos DOM
  const monthlyConsumptionInput = document.getElementById(
    'monthly-consumption'
  );
  const highUsageInput = document.getElementById('high-usage');
  const highUsageValue = document.getElementById('high-usage-value');
  const shiftPotentialInput = document.getElementById('shift-potential');
  const shiftPotentialValue = document.getElementById('shift-potential-value');
  const calculateButton = document.getElementById('calculate-savings');
  const monthlySavings = document.getElementById('monthly-savings');
  const annualSavings = document.getElementById('annual-savings');

  if (!calculateButton) return;

  // Actualizar valores de rango al mover los sliders
  highUsageInput.addEventListener('input', function () {
    highUsageValue.textContent = this.value + '%';
  });

  shiftPotentialInput.addEventListener('input', function () {
    shiftPotentialValue.textContent = this.value + '%';
  });

  // Función para calcular el ahorro
  calculateButton.addEventListener('click', function () {
    // Obtener valores
    const monthlyConsumption = parseFloat(monthlyConsumptionInput.value) || 300;
    const highUsage = parseFloat(highUsageInput.value) / 100;
    const shiftPotential = parseFloat(shiftPotentialInput.value) / 100;

    // Precios aproximados en €/kWh
    const pricePeak = 0.25; // Precio hora punta
    const priceValley = 0.15; // Precio hora valle
    const priceDifference = pricePeak - priceValley;

    // Cálculos
    const consumptionInPeakHours = monthlyConsumption * highUsage;
    const consumptionToShift = consumptionInPeakHours * shiftPotential;
    const monthlySavingsValue = consumptionToShift * priceDifference;
    const annualSavingsValue = monthlySavingsValue * 12;

    // Mostrar resultados con animación
    animateValue(monthlySavings, 0, monthlySavingsValue.toFixed(2), 1000);
    animateValue(annualSavings, 0, annualSavingsValue.toFixed(2), 1500);

    // Mostrar resultados con efecto visual
    const resultBoxes = document.querySelectorAll('.result-box');
    resultBoxes.forEach(box => {
      box.style.transform = 'scale(1.05)';
      setTimeout(() => {
        box.style.transform = 'scale(1)';
      }, 300);
    });
  });

  // Inicializar calculadora con un cálculo automático
  if (calculateButton) {
    setTimeout(() => {
      calculateButton.click();
    }, 1000);
  }
}

// ======================================================
// COMPARATIVA DE TARIFAS
// ======================================================
function initTariffComparison() {
  // Referencias a elementos DOM
  const profileOptions = document.querySelectorAll('.profile-option');
  const comparisonChart = document.getElementById('comparison-chart');
  const tariffRecommendations = document.getElementById(
    'tariff-recommendations'
  );

  if (!comparisonChart) return;

  // Datos de comparación para cada perfil
  const profileData = {
    morning: {
      pvpc: 85,
      fixed: 95,
      discrimination: 90,
      recommended: 'discrimination',
      text: 'Para tu perfil de consumo matutino, recomendamos una <strong>tarifa con discriminación horaria</strong> del mercado libre. Este tipo de tarifa te permite aprovechar precios más bajos en las primeras horas de la mañana, mientras mantienes precios estables durante el resto del día.',
      details:
        'La discriminación horaria te beneficia porque normalmente las horas de 10:00 a 14:00 tienen precios intermedios en estas tarifas, mientras que en PVPC serían horas punta. Si no puedes desplazar tu consumo a la madrugada, esta opción te ofrece más estabilidad que la tarifa regulada.'
    },
    evening: {
      pvpc: 75,
      fixed: 98,
      discrimination: 85,
      recommended: 'fixed',
      text: 'Para tu perfil de consumo vespertino, recomendamos una <strong>tarifa de precio fijo</strong> del mercado libre. Este tipo de tarifa te protege de los precios más altos que suelen darse en las tardes, especialmente durante las horas punta (18:00-22:00).',
      details:
        'Al concentrar tu consumo en las horas de mayor demanda energética, una tarifa fija te permitirá evitar los picos de precio que son habituales en la tarifa regulada PVPC. Aunque podrías perder algunas oportunidades de precios bajos, ganarás en estabilidad y previsibilidad.'
    },
    night: {
      pvpc: 100,
      fixed: 80,
      discrimination: 95,
      recommended: 'pvpc',
      text: 'Para tu perfil de consumo nocturno/madrugada, recomendamos la <strong>tarifa regulada PVPC</strong>. Esta tarifa te permitirá aprovechar al máximo los precios reducidos de las horas valle (00:00-08:00), que son significativamente más bajos.',
      details:
        'La tarifa PVPC ofrece los mejores precios durante la madrugada. Si concentras gran parte de tu consumo en estas horas (lavadoras, secadoras, carga de vehículos eléctricos, etc.), maximizarás tu ahorro. Además, los fines de semana todas las horas se consideran valle, lo que supone un ahorro adicional.'
    },
    distributed: {
      pvpc: 90,
      fixed: 95,
      discrimination: 88,
      recommended: 'fixed',
      text: 'Para tu perfil de consumo distribuido a lo largo del día, recomendamos una <strong>tarifa de precio fijo</strong> del mercado libre. Este tipo de tarifa te ofrece estabilidad y te permite predecir tus costes sin preocuparte por las fluctuaciones horarias.',
      details:
        'Al tener un consumo repartido en diferentes franjas horarias, la tarifa fija te proporciona tranquilidad. Aunque en algunos momentos podrías estar pagando más que con PVPC, en otros estarás pagando menos, y el resultado final suele ser más estable y predecible.'
    }
  };

  // Inicializar con el primer perfil seleccionado
  if (profileOptions.length > 0) {
    updateRecommendation('morning');

    // Añadir event listeners a las opciones de perfil
    profileOptions.forEach(option => {
      const radio = option.querySelector('input[type="radio"]');
      radio.addEventListener('change', function () {
        if (this.checked) {
          const profile = option.dataset.profile;
          updateRecommendation(profile);
        }
      });
    });
  }

  // Función para actualizar la recomendación basada en el perfil seleccionado
  function updateRecommendation(profile) {
    if (!comparisonChart || !tariffRecommendations) return;

    // Datos del perfil seleccionado
    const data = profileData[profile];

    // Actualizar gráfico de comparación
    comparisonChart.innerHTML = '';

    // Crear barras para cada tipo de tarifa
    const tariffTypes = [
      { key: 'pvpc', label: 'PVPC' },
      { key: 'fixed', label: 'Precio Fijo' },
      { key: 'discrimination', label: 'Discriminación' }
    ];

    tariffTypes.forEach(type => {
      const bar = document.createElement('div');
      bar.className = 'chart-bar';
      bar.style.height = `${data[type.key]}%`;
      bar.dataset.label = type.label;
      bar.dataset.value = `${data[type.key]}%`;

      // Destacar la tarifa recomendada
      if (type.key === data.recommended) {
        bar.style.background = 'linear-gradient(to top, var(--green), #a2fcc1)';
        bar.style.boxShadow = '0 0 15px rgba(162, 252, 193, 0.5)';
      }

      comparisonChart.appendChild(bar);
    });

    // Actualizar texto de recomendación
    let recommendedLabel = '';
    switch (data.recommended) {
      case 'pvpc':
        recommendedLabel = 'Tarifa Regulada (PVPC)';
        break;
      case 'fixed':
        recommendedLabel = 'Tarifa de Precio Fijo';
        break;
      case 'discrimination':
        recommendedLabel = 'Tarifa con Discriminación Horaria';
        break;
    }

    tariffRecommendations.innerHTML = `
      <div class="recommendation-header">
        <div class="recommendation-icon">🏆</div>
        <div>
          <h5 class="recommendation-title">${recommendedLabel}</h5>
          <p class="recommendation-subtitle">Mejor opción para tu perfil de consumo</p>
        </div>
      </div>
      <div class="recommendation-details">
        <p>${data.text}</p>
        <p>${data.details}</p>
      </div>
    `;
  }
}

// ======================================================
// EFECTOS VISUALES Y ANIMACIONES
// ======================================================
function addVisualEffects() {
  // Animación para las tarjetas de estrategias
  const strategyItems = document.querySelectorAll('.strategy-item');
  if (strategyItems.length > 0) {
    // Utilizar Intersection Observer para animar al hacer scroll
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('animated');
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.2 }
      );

      strategyItems.forEach(item => {
        observer.observe(item);
      });
    }
  }

  // Animación para las tarjetas de recursos
  const resourceCards = document.querySelectorAll('.resource-card');
  resourceCards.forEach(card => {
    card.addEventListener('mouseenter', function () {
      this.style.transform = 'translateY(-8px)';
    });

    card.addEventListener('mouseleave', function () {
      this.style.transform = 'translateY(-5px)';
    });
  });

  // Animación para los bloques de tarifas
  const tariffBlocks = document.querySelectorAll('.tariff-block');
  tariffBlocks.forEach(block => {
    block.addEventListener('mouseenter', function () {
      this.style.transform = 'translateY(-5px)';
    });

    block.addEventListener('mouseleave', function () {
      this.style.transform = 'translateY(0)';
    });
  });

  // Mejorar interactividad en FAQ
  const faqItems = document.querySelectorAll('.faq-container details');
  faqItems.forEach(item => {
    item.addEventListener('toggle', function () {
      if (this.open) {
        // Cerrar otros elementos abiertos (comportamiento de acordeón)
        faqItems.forEach(otherItem => {
          if (otherItem !== this && otherItem.open) {
            otherItem.open = false;
          }
        });
      }
    });
  });
}

// ======================================================
// FUNCIONES DE UTILIDAD
// ======================================================

// Función para formatear hora
function formatHour(hour) {
  return `${hour.toString().padStart(2, '0')}:00`;
}

// Función para animar el contador
function animateValue(element, start, end, duration) {
  if (!element) return;

  let startTimestamp = null;
  const step = timestamp => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    const value = progress * (end - start) + start;
    element.textContent = parseFloat(value).toFixed(2);
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  window.requestAnimationFrame(step);
}

// Función para determinar el periodo (valle, llano, punta) según la hora
function getPeriodFromHour(hour) {
  // Verificar si es fin de semana - todos los periodos serían valle
  const today = new Date();
  const isWeekend = today.getDay() === 0 || today.getDay() === 6;

  if (isWeekend) return 'valle';

  // Días laborables
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
