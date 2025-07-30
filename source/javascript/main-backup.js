import './../styles/styles.css';
import data_canary from '/public/data/canary_price.json';
// Lazy load tomorrow's data only when needed
let data_tomorrow_omie = null;
let data_tomorrow = null;

async function loadTomorrowData() {
  if (!data_tomorrow_omie || !data_tomorrow) {
    // Use dynamic imports for better initial load performance
    const [omieData, tomorrowData] = await Promise.all([
      import('/public/data/omie_data.json'),
      import('/public/data/tomorrow_price.json')
    ]);

    data_tomorrow_omie = omieData.default;
    data_tomorrow = tomorrowData.default;
  }

  return { data_tomorrow_omie, data_tomorrow };
}
import data_canary from '/public/data/canary_price.json';
import {
  reload_page,
  get_zone_color,
  width_mobile,
  day_names_us,
  is_week_end
} from './utils.js';

import {
  table_price,
  table_price_tomorrow,
  remove_tables,
  remove_tables_tomorrow
} from './table.js';

// Consolidated DOMContentLoaded listener - moved to main listener below

function reserveSpaceForDynamicElements() {
  const containerTable = document.querySelector('.container-wrapper');
  if (containerTable) {
    containerTable.style.minHeight = '600px';
  }

  const charts = document.querySelectorAll('.charts');
  charts.forEach(chart => {
    chart.style.minHeight = '500px';
  });
}

function loadAdsWithLessImpact() {
  if (window.adsbygoogle && window.adsbygoogle.length === 0) {
    window.addEventListener('load', function () {
      setTimeout(() => {
        (adsbygoogle = window.adsbygoogle || []).push({});
      }, 1000);
    });
  }
}

// Consolidated DOMContentLoaded listener - moved to main listener below

const options = {
  weekday: 'long',
  month: 'long',
  day: 'numeric'
};

const options_title = {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
  year: 'numeric'
};

const get_time_zone = Intl.DateTimeFormat().resolvedOptions().timeZone;

let user_hour = new Date().getHours();
let user_minutes = new Date().getMinutes();
let user_day = new Date();
const day_name = day_names_us[user_day.getDay()];
document.title = `Precios de la luz por hora hoy | ${user_day.toLocaleDateString(
  'es-ES',
  options_title
)}`;

const is_user_from_canary =
  get_time_zone === 'Atlantic/Canary' && user_hour > 22 && user_hour < 24;
let data_prices = is_user_from_canary ? data_canary : data_today;

const [{ price }] = data_prices.filter(({ hour }) => +hour == user_hour);

user_hour = user_hour < 10 ? `0${user_hour}` : user_hour;
user_minutes = user_minutes < 10 ? `0${user_minutes}` : user_minutes;

const price_element = document.getElementById('price');
const hours_element = document.getElementById('hours');
const minutes_element = document.getElementById('minutes');

price_element.textContent = `${price.toFixed(3)}`;
hours_element.textContent = user_hour;
minutes_element.textContent = user_minutes;

const main_element = document.getElementsByTagName('body')[0];

reload_page(user_minutes);

const filter_data_by_user_hour = data_prices.map(({ hour, price, ...rest }) => {
  return {
    hourHasPassed: +hour < user_hour ? true : false,
    price: price.toFixed(3),
    hour,
    ...rest
  };
});

let filter_data_today = filter_data_by_user_hour.sort(
  ({ price: a }, { price: b }) => a - b
);
/*This code is temporary. Hours are reordered based on prices, not Government nomenclature.*/
for (let [index, element] of filter_data_today.entries()) {
  if (index < 8) {
    element.zone = 'valle';
  } else if (index >= 8 && index < 16) {
    element.zone = 'llano';
  } else {
    element.zone = 'punta';
  }

  if (element.hour >= 0 && element.hour < 8 && !is_week_end(user_day)) {
    element.tramo = 'valle';
  } else if (
    (element.hour >= 8 && element.hour < 10 && !is_week_end(user_day)) ||
    (element.hour >= 14 && element.hour < 18 && !is_week_end(user_day)) ||
    (element.hour >= 22 && element.hour < 24 && !is_week_end(user_day))
  ) {
    element.tramo = 'llano';
  } else {
    element.tramo = 'punta';
  }

  if (is_week_end(user_day)) {
    element.tramo = 'valle';
  }
}

const [{ zone }] = filter_data_today.filter(({ hour }) => hour == user_hour);
main_element.style.backgroundColor = get_zone_color(zone);

let type_of_order;

function order_by_price() {
  filter_data_today = filter_data_today.sort(
    ({ price: a }, { price: b }) => a - b
  );
  table_price(filter_data_today.slice(0, 12), '.container-table-price-left');
  table_price(filter_data_today.slice(12, 24), '.container-table-price-right');

  type_of_order = 'price';
}

function order_by_hour() {
  filter_data_today = filter_data_today.sort(
    ({ hour: a }, { hour: b }) => a - b
  );
  table_price(filter_data_today.slice(0, 12), '.container-table-price-left');
  table_price(filter_data_today.slice(12, 24), '.container-table-price-right');
  type_of_order = 'hour';
}

order_by_hour();

// Debounced event handlers to prevent rapid interactions
let orderDebounceTimer = null;

function debounce(func, delay) {
  return function (...args) {
    clearTimeout(orderDebounceTimer);
    orderDebounceTimer = setTimeout(() => func.apply(this, args), delay);
  };
}

const debouncedOrderByPrice = debounce(() => {
  requestAnimationFrame(() => {
    remove_tables();
    order_by_price();
  });
}, 200);

const debouncedOrderByHour = debounce(() => {
  requestAnimationFrame(() => {
    remove_tables();
    order_by_hour();
  });
}, 200);

document
  .getElementById('order-price')
  .addEventListener('click', debouncedOrderByPrice);

document
  .getElementById('order-hour')
  .addEventListener('click', debouncedOrderByHour);

/*
Prices are published at 20:15,
at 20:30 I publish the next day's data,
this table will only be available until 00:00.
*/

// Global variables for tomorrow's data (loaded lazily)
let filter_data_tomorrow = null;
let tomorrowDataProcessed = false;

// Check if we should show tomorrow's data
const TWENTY_PAST_EIGHT_MINUTES = 1220;
const QUARTER_PAST_ONE = 790;
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);

const its_time_to_show_the_data_from_esios =
  user_hour * 60 + +user_minutes >= TWENTY_PAST_EIGHT_MINUTES && user_hour < 24;

const its_time_to_show_the_data_from_omie =
  user_hour * 60 + +user_minutes >= QUARTER_PAST_ONE &&
  user_hour * 60 < TWENTY_PAST_EIGHT_MINUTES;

// Lazy load and process tomorrow's data only when needed
async function initializeTomorrowData() {
  if (tomorrowDataProcessed) return;

  try {
    const { data_tomorrow_omie: omieData, data_tomorrow: tomorrowData } =
      await loadTomorrowData();

    if (!omieData || !tomorrowData || !omieData[0] || !tomorrowData[0]) {
      console.warn('Tomorrow data not available yet');
      return;
    }

    const get_day_from_data_omie = +omieData[0].day;
    const get_month_from_data_omie = +omieData[0].month;
    const get_day_from_data_esios = +tomorrowData[0].day.split('/')[0];
    const get_month_from_data_esios = +tomorrowData[0].day.split('/')[1];

    const check_the_day_in_data_omie =
      get_day_from_data_omie === tomorrow.getDate() &&
      get_month_from_data_omie === tomorrow.getMonth() + 1;

    const its_the_right_day =
      get_day_from_data_esios === tomorrow.getDate() &&
      get_month_from_data_esios === tomorrow.getMonth() + 1;

    // Process tomorrow's price data
    filter_data_tomorrow = tomorrowData
      .sort(({ price: a }, { price: b }) => a - b)
      .map(({ price, ...rest }) => ({
        price: price.toFixed(3),
        ...rest
      }));

    // Add zone and tramo information
    for (let [index, element] of filter_data_tomorrow.entries()) {
      if (index < 8) {
        element.zone = 'valle';
      } else if (index >= 8 && index < 16) {
        element.zone = 'llano';
      } else {
        element.zone = 'punta';
      }

      if (element.hour >= 0 && element.hour < 8 && !is_week_end(tomorrow)) {
        element.tramo = 'valle';
      } else if (
        (element.hour >= 8 && element.hour < 10 && !is_week_end(tomorrow)) ||
        (element.hour >= 14 && element.hour < 18 && !is_week_end(tomorrow)) ||
        (element.hour >= 22 && element.hour < 24 && !is_week_end(tomorrow))
      ) {
        element.tramo = 'llano';
      } else {
        element.tramo = 'punta';
      }

      if (is_week_end(tomorrow)) {
        element.tramo = 'valle';
      }
    }

    // Show/hide tomorrow's data UI
    const get_button_next_day = document.getElementById(
      'button-prices-next-day'
    );
    const container_table_tomorrow = document.querySelector('.table-next-day');

    if (get_button_next_day) {
      if (its_time_to_show_the_data_from_omie && check_the_day_in_data_omie) {
        get_button_next_day.style.display = 'inline-block';
        get_button_next_day.textContent = `Precios de la luz por horas para: ${tomorrow.toLocaleDateString(
          'es-ES',
          options
        )}`;
      } else {
        get_button_next_day.style.display = 'none';
      }
    }

    if (container_table_tomorrow) {
      if (its_time_to_show_the_data_from_esios && its_the_right_day) {
        container_table_tomorrow.style.display = 'grid';
        order_table_tomorrow_by_price();
      } else {
        container_table_tomorrow.style.display = 'none';
      }
    }

    tomorrowDataProcessed = true;
  } catch (error) {
    console.warn('Failed to load tomorrow data:', error);
  }
}

// Initialize tomorrow data only if we need to show it
if (
  its_time_to_show_the_data_from_omie ||
  its_time_to_show_the_data_from_esios
) {
  // Use requestIdleCallback for non-critical data loading
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => initializeTomorrowData());
  } else {
    setTimeout(() => initializeTomorrowData(), 100);
  }
}

async function order_table_tomorrow_by_price() {
  if (!filter_data_tomorrow) {
    await initializeTomorrowData();
  }

  if (!filter_data_tomorrow) return;

  filter_data_tomorrow = filter_data_tomorrow.sort(
    ({ price: a }, { price: b }) => a - b
  );

  table_price_tomorrow(
    filter_data_tomorrow.slice(0, 12),
    '.table-next-day-grid-left'
  );
  table_price_tomorrow(
    filter_data_tomorrow.slice(12, 24),
    '.table-next-day-grid-right'
  );
}

async function order_table_tomorrow_by_hour() {
  if (!filter_data_tomorrow) {
    await initializeTomorrowData();
  }

  if (!filter_data_tomorrow) return;

  filter_data_tomorrow = filter_data_tomorrow.sort(
    ({ hour: a }, { hour: b }) => a - b
  );
  table_price_tomorrow(
    filter_data_tomorrow.slice(0, 12),
    '.table-next-day-grid-left'
  );
  table_price_tomorrow(
    filter_data_tomorrow.slice(12, 24),
    '.table-next-day-grid-right'
  );
}

// Debounced handlers for tomorrow's data
const debouncedOrderTomorrowByPrice = debounce(() => {
  requestAnimationFrame(() => {
    remove_tables_tomorrow();
    order_table_tomorrow_by_price();
  });
}, 200);

const debouncedOrderTomorrowByHour = debounce(() => {
  requestAnimationFrame(() => {
    remove_tables_tomorrow();
    order_table_tomorrow_by_hour();
  });
}, 200);

document
  .getElementById('order-price-next')
  .addEventListener('click', debouncedOrderTomorrowByPrice);

document
  .getElementById('order-hour-next')
  .addEventListener('click', debouncedOrderTomorrowByHour);

// Debounced checkbox change handler
const debouncedCheckboxChange = debounce(() => {
  requestAnimationFrame(() => {
    if (type_of_order === 'price') {
      remove_tables();
      order_by_price();
    } else {
      remove_tables();
      order_by_hour();
    }
  });
}, 100);

document
  .getElementById('checkbox-hours')
  .addEventListener('change', debouncedCheckboxChange);

// Memoized price calculations to avoid recalculating expensive operations
const priceCalculationsCache = new Map();

function calculatePriceStats(data) {
  // Create cache key based on data
  const cacheKey = data.map(item => `${item.hour}-${item.price}`).join('|');

  if (priceCalculationsCache.has(cacheKey)) {
    return priceCalculationsCache.get(cacheKey);
  }

  // Perform calculations only if not cached
  const sortedData = data
    .map(({ price, ...rest }) => ({
      price: Number(price),
      ...rest
    }))
    .sort(({ price: a }, { price: b }) => b - a);

  const max_price = sortedData[0];
  const min_price = sortedData[sortedData.length - 1];
  const prices = sortedData.map(({ price }) => price);
  const avg_price = prices.reduce((a, b) => a + b, 0) / prices.length;

  const result = { max_price, min_price, avg_price, sortedData };

  // Cache the result
  priceCalculationsCache.set(cacheKey, result);

  // Limit cache size to prevent memory leaks
  if (priceCalculationsCache.size > 10) {
    const firstKey = priceCalculationsCache.keys().next().value;
    priceCalculationsCache.delete(firstKey);
  }

  return result;
}

const { max_price, min_price, avg_price } =
  calculatePriceStats(filter_data_today);

// Use DocumentFragment for batch DOM insertion
function insertPriceStats(max_price, min_price, avg_price) {
  const templates = [
    {
      id: 'contanier-avg-price',
      content: `<span>El precio medio del día</span> <span class="container-max-min-avg-number">${avg_price.toFixed(
        3
      )} €/kWh</span>`
    },
    {
      id: 'contanier-min-price',
      content: `<span>La hora más barata</span> <span class="container-max-min-avg-number">${
        min_price.hour
      }:00 - ${min_price.price.toFixed(3)} €/kWh</span>`
    },
    {
      id: 'contanier-max-price',
      content: `<span>La hora más cara</span> <span class="container-max-min-avg-number">${
        max_price.hour
      }:00 - ${max_price.price.toFixed(3)} €/kWh</span>`
    }
  ];

  // Batch DOM operations using requestAnimationFrame
  requestAnimationFrame(() => {
    templates.forEach(({ id, content }) => {
      const element = document.getElementById(id);
      if (element) {
        element.insertAdjacentHTML('beforeend', content);
      }
    });
  });
}

insertPriceStats(max_price, min_price, avg_price);

const text_whatsApp = `whatsapp://send?text=El precio de la luz a las ${user_hour}:${user_minutes} es de ${price.toFixed(
  3
)} €/kWh https://www.apaga-luz.com/?utm_source=whatsapp`;
const button_whatsApp = document.getElementById('btn-whatsapp');
button_whatsApp.href = text_whatsApp;

const text_whatsApp_avg = `whatsapp://send?text=
👉🏻 Para el ${user_day.toLocaleDateString(
  'es-ES',
  options
)}:%0a💡 El precio medio de la luz es de ${avg_price.toFixed(
  3
)} €/kWh %0a✅ La hora más barata es a las ${
  min_price.hour
}:00 - ${min_price.price.toFixed(3)} €/kWh %0a🚨 La hora más cara es a las ${
  max_price.hour
}:00 - ${max_price.price.toFixed(
  3
)} €/kWh %0ahttps://www.apaga-luz.com/?utm_source=whatsapp_avg`;

const button_whatsApp_avg = document.getElementById('btn-whatsapp-avg');
button_whatsApp_avg.href = text_whatsApp_avg;

let root = document.documentElement;

document.getElementById('tramos').addEventListener('change', e => {
  const {
    target: { checked }
  } = e;
  const get_price_element = document.querySelectorAll(
    '.container-table-price-element-hour'
  );

  get_price_element.forEach(element => {
    if (checked) {
      element.classList.remove('tramo-hidden');
    } else {
      element.classList.add('tramo-hidden');
    }
  });
});

document.getElementById('color-blindness').addEventListener('change', e => {
  const {
    target: { checked }
  } = e;
  if (checked) {
    root.style.setProperty('--orange-light', 'rgb(255, 176, 0)');
    root.style.setProperty('--green-light', 'rgb(100, 143, 255)');
    root.style.setProperty('--red-light', 'rgb(220, 38, 127)');

    const get_color_blidness_zone =
      zone === 'VALLE'
        ? 'rgb(100, 143, 255)'
        : zone === 'llano'
        ? 'rgb(255, 176, 0)'
        : 'rgb(220, 38, 127)';
    main_element.style.backgroundColor = get_color_blidness_zone;
  } else {
    root.style.setProperty('--orange-light', '#ffae3ab3');
    root.style.setProperty('--green-light', '#a2fcc1b3');
    root.style.setProperty('--red-light', '#ec1d2fb3');
    main_element.style.backgroundColor = get_zone_color(zone);
  }
});

// Form handling and validation functions - moved to consolidated listener below

// CONSOLIDATED DOMContentLoaded LISTENER - All initialization logic in one place
document.addEventListener('DOMContentLoaded', function () {
  // Performance optimization: batch DOM queries
  const elements = {
    body: document.body,
    menuToggle: document.querySelector('.menu-toggle'),
    header: document.querySelector('.site-header'),
    fileInput: document.getElementById('fc-generated-1-single-file'),
    fileInfo: document.getElementById('file-info'),
    fileContainer: document.querySelector('.form-file-container'),
    form: document.getElementById('formulario-ahorro'),
    dropdownToggles: document.querySelectorAll('.dropdown-toggle'),
    navLinks: document.querySelectorAll(
      '.nav-link:not(.dropdown-toggle), .dropdown-item'
    )
  };

  // Initialize all components
  initializePageComponents(elements);
  setupFormHandling(
    elements.form,
    elements.fileInput,
    elements.fileInfo,
    elements.fileContainer
  );
  setupMenuNavigation(
    elements.menuToggle,
    elements.header,
    elements.dropdownToggles,
    elements.navLinks
  );
  injectFormStyles();
});

// Helper functions for better organization and performance
function initializePageComponents(elements) {
  // Reserve space for dynamic elements to prevent layout shifts
  reserveSpaceForDynamicElements();

  // Load ads with reduced impact
  loadAdsWithLessImpact();

  // Optimized: Use a more targeted approach instead of constant DOM monitoring
  // Only reset padding when ads are loaded or specific events occur
  let paddingResetTimer = null;

  function resetBodyPaddingIfNeeded() {
    if (paddingResetTimer) return; // Throttle the resets

    paddingResetTimer = setTimeout(() => {
      if (elements.body.style.padding) {
        elements.body.style.padding = '';
      }
      paddingResetTimer = null;
    }, 100);
  }

  // Only observe when necessary (e.g., after ads load)
  window.addEventListener('load', resetBodyPaddingIfNeeded);

  // Occasional check instead of constant monitoring
  setInterval(resetBodyPaddingIfNeeded, 5000);
}

function setupFormHandling(form, fileInput, fileInfo, fileContainer) {
  if (fileInput && fileInfo) {
    fileInput.addEventListener('change', function () {
      requestAnimationFrame(() => {
        if (this.files && this.files[0]) {
          const fileName = this.files[0].name;
          fileInfo.innerHTML = `<span style="color: #ec7f00; font-weight: 600;">✓ Archivo seleccionado:</span> ${fileName}`;
          fileContainer.style.borderColor = '#a2fcc1';
          fileContainer.style.backgroundColor = 'rgba(162, 252, 193, 0.1)';
        } else {
          fileInfo.textContent = 'No se ha seleccionado ningún archivo.';
          fileContainer.style.borderColor = 'rgba(236, 127, 0, 0.3)';
          fileContainer.style.backgroundColor = 'rgba(236, 127, 0, 0.05)';
        }
      });
    });

    if (fileContainer) {
      fileContainer.addEventListener('click', function (e) {
        if (e.target !== fileInput) {
          fileInput.click();
        }
      });
    }
  }

  if (form) {
    const inputs = form.querySelectorAll('input[required], textarea[required]');

    inputs.forEach(input => {
      input.addEventListener('blur', function () {
        requestAnimationFrame(() => validateInput(this));
      });

      input.addEventListener('input', function () {
        if (this.value.trim() !== '') {
          requestAnimationFrame(() => clearInputError(this));
        }
      });
    });

    const emailInput = form.querySelector('input[type="email"]');
    if (emailInput) {
      emailInput.addEventListener('blur', function () {
        requestAnimationFrame(() => validateEmail(this));
      });
    }

    form.addEventListener('submit', function (e) {
      const submitButton = this.querySelector('.form-button');
      if (submitButton) {
        requestAnimationFrame(() => {
          submitButton.innerHTML =
            '<span class="form-button-text">Enviando...</span>';
          submitButton.disabled = true;
          submitButton.style.opacity = '0.8';
        });
      }
    });
  }
}

function validateInput(input) {
  if (input.value.trim() === '') {
    input.classList.add('form-input-error');
    let errorMsg = input.parentNode.querySelector('.form-error-message');
    if (!errorMsg) {
      errorMsg = document.createElement('div');
      errorMsg.className = 'form-error-message';
      errorMsg.textContent = 'Este campo es obligatorio';
      input.parentNode.appendChild(errorMsg);
    }
  } else {
    clearInputError(input);
  }
}

function clearInputError(input) {
  input.classList.remove('form-input-error');
  const errorMsg = input.parentNode.querySelector('.form-error-message');
  if (errorMsg) {
    errorMsg.remove();
  }
}

function validateEmail(emailInput) {
  const isValidEmail = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  if (emailInput.value.trim() !== '' && !isValidEmail(emailInput.value)) {
    emailInput.classList.add('form-input-error');
    let errorMsg = emailInput.parentNode.querySelector('.form-error-message');
    if (!errorMsg) {
      errorMsg = document.createElement('div');
      errorMsg.className = 'form-error-message';
      errorMsg.textContent = 'Por favor, introduce un email válido';
      emailInput.parentNode.appendChild(errorMsg);
    } else {
      errorMsg.textContent = 'Por favor, introduce un email válido';
    }
  }
}

function setupMenuNavigation(menuToggle, header, dropdownToggles, navLinks) {
  if (menuToggle) {
    menuToggle.addEventListener('click', function () {
      requestAnimationFrame(() => {
        header.classList.toggle('menu-open');
        const isExpanded = header.classList.contains('menu-open');
        this.setAttribute('aria-expanded', isExpanded);
        document.body.style.overflow = isExpanded ? 'hidden' : '';
      });
    });
  }

  dropdownToggles.forEach(toggle => {
    toggle.addEventListener('click', function (e) {
      if (window.innerWidth < 992) {
        e.preventDefault();
        requestAnimationFrame(() => {
          const parent = this.closest('.has-dropdown');
          parent.classList.toggle('open');
        });
      }
    });
  });

  navLinks.forEach(link => {
    link.addEventListener('click', function () {
      if (window.innerWidth < 992) {
        requestAnimationFrame(() => {
          header.classList.remove('menu-open');
          menuToggle.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
        });
      }
    });
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth >= 992) {
      requestAnimationFrame(() => {
        header.classList.remove('menu-open');
        menuToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        document.querySelectorAll('.has-dropdown.open').forEach(item => {
          item.classList.remove('open');
        });
      });
    }
  });
}

function injectFormStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .form-input-error {
      border-color: #ec1d2f !important;
      background-color: rgba(236, 29, 47, 0.05) !important;
    }
    .form-error-message {
      color: #ec1d2f;
      font-size: 0.8rem;
      margin-top: 0.25rem;
      animation: fadeIn 0.3s;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-5px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);
}
